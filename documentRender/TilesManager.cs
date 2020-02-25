using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Security;
using System.Text;
using System.Threading.Tasks;

namespace DocumentRender
{
    internal class TilesManager : IDisposable
    {
        private readonly object _locker = new object();
        private NativeXps _nativeXps;
        private GCHandle _dataHandle;
        
        public TilesManager(Stream xpsStream)
        {
            if (xpsStream == null)
                return;

            var errorBuffer = new byte[256];
            var errorHandle = GCHandle.Alloc(errorBuffer, GCHandleType.Pinned);
            var dataBuffer = StreamToByteArray(xpsStream);
            _dataHandle = GCHandle.Alloc(dataBuffer, GCHandleType.Pinned);
            try
            {
                lock (_locker)
                {
                    if (_nativeXps != null)
                        throw new RenderException("Already initialized");

                    var pageCount = 0;
                    var xpsNativePtr = RenderLibrary.open_xps_with_stream(
                        _dataHandle.AddrOfPinnedObject(),
                        dataBuffer.Length,
                        ref pageCount,
                        errorHandle.AddrOfPinnedObject(),
                        errorBuffer.Length);

                    if (xpsNativePtr == IntPtr.Zero)
                    {
                        var nativeError = Encoding.UTF8.GetString(errorBuffer).TrimEnd((char)0);
                        throw new Exception(nativeError);
                    }

                    if (pageCount == 0)
                        throw new Exception("Initialization failed");

                    _nativeXps = new NativeXps(xpsNativePtr, pageCount, _dataHandle);
                }
            }
            catch (RenderException)
            {
                _dataHandle.Free();
                _nativeXps = null;
                throw;
            }
            catch (Exception e)
            {
                _dataHandle.Free();
                _nativeXps = null;
                throw new RenderException("Initialization failed. " + e.Message);
            }
            finally
            {
                errorHandle.Free();
            }
        }

        public void LoadPage(int pageNumber, ref int pageWidth, ref int pageHeight, bool skipText)
        {
            lock (_locker)
            {
                try
                {
                    if (_nativeXps == null || _nativeXps.Pages == null || _nativeXps.Pages[pageNumber] != IntPtr.Zero)
                        return;
                }
                catch (Exception e)
                {
                    new RenderException(string.Format("Failed open page %i %s", pageNumber, e.Message));
                    return;
                }

                var errorBuffer = new byte[256];
                var errorHandle = GCHandle.Alloc(errorBuffer, GCHandleType.Pinned);
                try
                {
                    var pagePtr = RenderLibrary.open_xps_page(_nativeXps.XpsPtr, pageNumber, ref pageWidth,
                           ref pageHeight, errorHandle.AddrOfPinnedObject(), errorBuffer.Length, skipText ? 1 : 0);

                    if (pagePtr == IntPtr.Zero)
                    {
                        var nativeError = Encoding.UTF8.GetString(errorBuffer).TrimEnd((char)0);
                        new RenderException(string.Format("Failed open page %i %s", pageNumber, nativeError));
                    }
                    else
                    {
                        _nativeXps.Pages[pageNumber] = pagePtr;
                    }
                }
                finally
                {
                    errorHandle.Free();
                }
            }
        }

        private bool _canBeDisposed = true;

        public bool CanDispose
        {
            get
            {
                lock (_locker)
                {
                    return _canBeDisposed;
                }
            }
            set
            {
                lock (_locker)
                {
                    _canBeDisposed = value;
                }
            }
        }

        [SecurityCritical]
        public Bitmap GetPage(Tile page, bool isPrinting)
        {
            var imgBuffer = new byte[page.Width * page.Height * 4];
            var imgHandle = GCHandle.Alloc(imgBuffer, GCHandleType.Pinned);
            try
            {
                var pagePtr = _nativeXps.Pages[page.PageNum];
                if (RenderLibrary.render_page(imgHandle.AddrOfPinnedObject(), pagePtr, (float)page.Scale, page.Width, page.Height) == 0)
                {
                    var bitmap = new Bitmap(page.Width, page.Height, 4 * page.Width, PixelFormat.Format32bppPArgb, Marshal.UnsafeAddrOfPinnedArrayElement(imgBuffer, 0));
                    return bitmap;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception)
            {
                return null;
            }
            finally
            {
                imgHandle.Free();
            }
        }

        [SecurityCritical]
        public byte[] GetPageInBytes(Tile page, bool isPrinting)
        {
            var imgBuffer = new byte[page.Width * page.Height * 4];
            var imgHandle = GCHandle.Alloc(imgBuffer, GCHandleType.Pinned);
            try
            {
                var pagePtr = _nativeXps.Pages[page.PageNum];
                if (RenderLibrary.render_page(imgHandle.AddrOfPinnedObject(), pagePtr, (float)page.Scale, page.Width, page.Height) == 0)
                {
                    using (var bitmap = new Bitmap(page.Width, page.Height, 4 * page.Width, PixelFormat.Format32bppPArgb, Marshal.UnsafeAddrOfPinnedArrayElement(imgBuffer, 0)))
                    using (var ms = new MemoryStream())
                    {
                        bitmap.Save(ms, ImageFormat.Png);
                        imgBuffer = ms.ToArray();
                    }
                    return imgBuffer;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception)
            {
                return null;
            }
            finally
            {
                imgHandle.Free();
            }
        }

        public int PageCount => _nativeXps?.Pages.Length ?? 0;

        public static byte[] StreamToByteArray(Stream stream)
        {
            var position = stream.Position;
            stream.Position = 0;
            var dataBuffer = new byte[stream.Length];
            var offset = 0;
            int bytesRead;
            do
            {
                var count = 4096;
                var left = stream.Length - offset;
                if (left < count)
                    count = (int)left;
                bytesRead = stream.Read(dataBuffer, offset, count);
                offset += bytesRead;
            } while (bytesRead > 0);
            stream.Position = position;
            return dataBuffer;
        }

        public void Dispose()
        {
            lock (_locker)
            {
                if (_nativeXps != null)
                {
                    Task.Run(async () =>
                    {
                        while (!CanDispose)
                            await Task.Delay(2000);

                        try
                        {
                            _nativeXps.Dispose();
                            _nativeXps = null;
                            _dataHandle.Free();
                        }
                        catch
                        {

                        }
                    });
                }
            }
        }
    }

    internal class RenderException : Exception
    {
        public RenderException(string text) : base(text)
        {

        }
    }
}