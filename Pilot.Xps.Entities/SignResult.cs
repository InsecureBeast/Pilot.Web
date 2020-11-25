using System;

namespace Pilot.Xps.Entities
{
    [Flags]
    public enum SignResult
    {
        /// <summary>
        /// Нет подходящего запроса на подпись
        /// </summary>
        NoMatchedSignRequest = 0x1,
        /// <summary>
        /// Данная подпись уже существует
        /// </summary>
        SignatureExists = 0x2,
        /// <summary>
        /// Части пакета сигнатуры конфликтуют с частями пакета XPS
        /// </summary>
        PackageConflict = 0x4,
        /// <summary>
        /// Подпись успешно добавлена
        /// </summary>
        SignedSuccessfully = 0x8
    }
}
