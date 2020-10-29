using System;
using System.Linq;
using Ascon.Pilot.Common;
using Ascon.Pilot.DataClasses;
using Pilot.Web.Model.DataObjects;

namespace Pilot.Web.Model
{
    static class FileExtensions
    {
        public static INFile GetSourceFile(this PObject document)
        {
            return document.ActualFileSnapshot.Files.FirstOrDefault(f => !FileExtensionHelper.IsThumbnailAlike(f.Name));
        }

    }
}
