using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Model.Bim.Model
{
    class FileVersion
    {
        public FileVersion(INFile file, INPerson creator, Guid sourceFileId, Guid modelPartId, bool isRebuild)
        {
            File = file;
            Creator = creator;
            SourceFileId = sourceFileId;
            ModelPartId = modelPartId;
            IsRebuild = isRebuild;
        }

        public INFile File { get; }
        public INPerson Creator { get; }
        public Guid SourceFileId { get; }
        public Guid ModelPartId { get; }
        public bool IsRebuild { get; }
    }
}
