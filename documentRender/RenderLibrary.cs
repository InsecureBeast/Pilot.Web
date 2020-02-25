using System;
using System.IO;
using System.Runtime.InteropServices;

namespace DocumentRender
{
    internal static class RenderLibrary
    {
        private const string LM_RENDER_LIBRARY_FILE_NAME = "Ascon.Pilot.Render.dll";

        [DllImport("kernel32", CharSet = CharSet.Ansi, SetLastError = true)]
        private static extern IntPtr LoadLibrary(string fileName);

        static RenderLibrary()
        {
            var directory = DirectoryProvider.GetCurrentDirectory();
            var filePath = GetRenderDllPath(directory);
            LoadLibrary(filePath);
        }

        static string GetRenderDllPath(string directory)
        {
            var Is64BitProcess = false;
            const string X64_DIRECTORY_NAME = "x64";
            const string X86_DIRECTORY_NAME = "x86";
            if (IntPtr.Size == 8)
            {
                Is64BitProcess = true;
            }
            else if (IntPtr.Size == 4)
            {
                // 32 bit machine
            }
            return Path.Combine(directory, Is64BitProcess ? X64_DIRECTORY_NAME : X86_DIRECTORY_NAME, LM_RENDER_LIBRARY_FILE_NAME);
        }

        [DllImport(LM_RENDER_LIBRARY_FILE_NAME, EntryPoint = "open_xps_with_stream", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.StdCall)]
        public static extern IntPtr open_xps_with_stream(
             IntPtr dataBuffer,
             [MarshalAs(UnmanagedType.I4)] int dataBufferSize,
             [MarshalAs(UnmanagedType.I4)] ref int pages,
             IntPtr errBuffer,
             [MarshalAs(UnmanagedType.I4)] int errBufferSize);

        [DllImport(LM_RENDER_LIBRARY_FILE_NAME, EntryPoint = "close_xps", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.StdCall)]
        public static extern void close_xps(IntPtr appPtr);

        [DllImport(LM_RENDER_LIBRARY_FILE_NAME, EntryPoint = "close_page", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.StdCall)]
        public static extern void close_page(IntPtr appPtr, IntPtr pagePtr);

        [DllImport(LM_RENDER_LIBRARY_FILE_NAME, EntryPoint = "open_xps_page", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.StdCall)]
        public static extern IntPtr open_xps_page(
            IntPtr appPtr,
            [MarshalAs(UnmanagedType.I4)] int pagenum,
            [MarshalAs(UnmanagedType.I4)] ref int pageWidth,
            [MarshalAs(UnmanagedType.I4)] ref int pageHeight,
            IntPtr errBuffer,
            [MarshalAs(UnmanagedType.I4)] int errBufferSize,
            [MarshalAs(UnmanagedType.I4)] int skipText);

        [DllImport(LM_RENDER_LIBRARY_FILE_NAME, EntryPoint = "render_page", CharSet = CharSet.Ansi, CallingConvention = CallingConvention.StdCall)]
        public static extern int render_page(
            IntPtr imgBuffer,
            IntPtr pagePtr,
            [MarshalAs(UnmanagedType.R4)] float scale,
            [MarshalAs(UnmanagedType.I4)] int tileWidth,
            [MarshalAs(UnmanagedType.I4)] int tileHeight);
    }
}
