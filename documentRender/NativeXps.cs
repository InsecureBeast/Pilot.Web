using System;
using System.Runtime.InteropServices;

namespace DocumentRender
{
    internal class NativeXps : IDisposable
    {
        public IntPtr[] Pages { get; private set; }
        public IntPtr XpsPtr { get; private set; }

        public NativeXps(IntPtr docNativePtr, int pageCount, GCHandle dataHandle)
        {
            XpsPtr = docNativePtr;
            Pages = new IntPtr[pageCount];
        }

        public void Dispose()
        {

            if (XpsPtr == IntPtr.Zero)
                return;

            foreach (var page in Pages)
            {
                try
                {
                    RenderLibrary.close_page(XpsPtr, page);
                }
                catch
                {
                }
            }
            Pages = null;

            try
            {
                RenderLibrary.close_xps(XpsPtr);
            }
            finally
            {
                XpsPtr = IntPtr.Zero;
            }
        }
    }
}