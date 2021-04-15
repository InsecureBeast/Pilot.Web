using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Ascon.Pilot.BimUtils;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Model.Bim.Model
{
    interface IModelPartDirectory
    {
        string GetPartModelPath();
        string GetFileToMergePath(INFile file);
        string GetTempFileToMergePath(INFile file);
        void Clear();
    }

    class ModelPartDirectory : IModelPartDirectory
    {
        private readonly string _modelCacheDirectory;
        private readonly string _partModelFilename;

        public ModelPartDirectory(Guid dataBaseId, Guid coordinationModelId, Guid modelPartId)
        {
            var dataBaseName = $"db_{dataBaseId}";
            var coordinationModelName = $"cm_{coordinationModelId}";
            var modelPartName = $"mp_{modelPartId}";
            _modelCacheDirectory = Path.Combine(DirectoryProvider.GetTempPath(), dataBaseName, coordinationModelName, modelPartName);
            if (!Directory.Exists(_modelCacheDirectory))
                Directory.CreateDirectory(_modelCacheDirectory);

            _partModelFilename = Path.Combine(_modelCacheDirectory, $"{modelPartName}.bm");
        }

        public string GetPartModelPath()
        {
            return _partModelFilename;
        }

        public string GetFileToMergePath(INFile file)
        {
            var toMergePartPath = Path.Combine(_modelCacheDirectory, $"f_{Guid.NewGuid()}.mrgc");
            return toMergePartPath;
        }

        public string GetTempFileToMergePath(INFile file)
        {
            var toMergePartPath = Path.Combine(_modelCacheDirectory, $"ft_{file.Id}.mrgc");
            return toMergePartPath;
        }

        public void Clear()
        {
            try
            {
                if (!Directory.Exists(_modelCacheDirectory))
                    return;

                var root = new DirectoryInfo(_modelCacheDirectory);
                foreach (FileInfo file in root.EnumerateFiles())
                {
                    file.Delete();
                }

                foreach (DirectoryInfo dir in root.EnumerateDirectories())
                {
                    dir.Delete(true);
                }
            }
            catch
            {
                //
            }
        }
    }

    internal class BimModelPartVersionsDiffResult
    {
        public IReadOnlyList<IfcNode> AddedNodes { get; }
        public IReadOnlyList<IfcNode> ModifiedNodes { get; }
        public IReadOnlyList<IfcNode> AttributesModifiedNodes { get; }
        public IList<IfcNode> DeletedNodes { get; }
        public IList<Tessellation> TessellationsToRemove { get; }

        public BimModelPartVersionsDiffResult(IReadOnlyList<IfcNode> addedNodes,
            IReadOnlyList<IfcNode> modifiedNodes,
            IReadOnlyList<IfcNode> attributesModifiedNodes,
            IList<IfcNode> deletedNodes,
            IList<Tessellation> tessellationsToRemove)
        {
            AddedNodes = addedNodes;
            ModifiedNodes = modifiedNodes;
            DeletedNodes = deletedNodes;
            AttributesModifiedNodes = attributesModifiedNodes;

            TessellationsToRemove = tessellationsToRemove;
        }
    }

    internal class ModelPartVersionBuilder
    {
        private readonly INObject _modelPart;
        private readonly IServerApiService _repository;

        public ModelPartVersionBuilder(INObject modelPart, IServerApiService repository)
        {
            _modelPart = modelPart;
            _repository = repository;
        }

        public List<FileVersion> BuildVersions()
        {
            var allVersions = new List<FileVersion>();
            var snapshots = _modelPart.PreviousFileSnapshots.OrderBy(s => s.Created).ToList();
            for (var i = 0; i < snapshots.Count; i++)
            {
                var isRebuild = i != 0;
                AddVersion(snapshots[i], allVersions, isRebuild);
            }

            var isRebuildActual = _modelPart.PreviousFileSnapshots.Count != 0;
            AddVersion(_modelPart.ActualFileSnapshot, allVersions, isRebuildActual);

            return allVersions.OrderBy(v => v.File.Created).ToList();
        }

        private void AddVersion(INFilesSnapshot filesSnapshot, ICollection<FileVersion> allVersions, bool isRebuild)
        {
            var files = filesSnapshot.Files.Where(x => Path.GetExtension(x.Name) == BimConstants.MODEL_PART_FILE_EXTENSION)
                .OrderBy(f => f.Created)
                .ToList();

            for (var i = 0; i < files.Count; i++)
            {
                if (isRebuild)
                    isRebuild = i == 0;

                var version = CreateFileVersion(files[i], isRebuild);
                allVersions.Add(version);
            }
        }

        public FileVersion CreateFileVersion(INFile file, bool isRebuild)
        {
            var creator = _repository.GetPerson(file.CreatorId);
            var sourceFileRelation = _modelPart.Relations.FirstOrDefault(r => r.Type == RelationType.SourceFiles);
            var sourceObjectId = sourceFileRelation.TargetId;
            var version = new FileVersion(file, creator, sourceObjectId, _modelPart.Id, isRebuild);
            return version;
        }
    }

    static class ListHelpers
    {
        //Inspired by https://www.codeproject.com/Articles/779344/Considerations-on-Efficient-use-of-LINQ-Extension
        //Efficient lazy chunking without additional Enumerator.MoveNext() calls and collections copy
        public static IEnumerable<IList<T>> Batch<T>(this IEnumerable<T> source,
            int chunkSize)
        {
            var e = source.GetEnumerator();
            bool Mover() => e.MoveNext();
            var count = 0;
            while (Mover())
            {
                var chunk = new List<T>(chunkSize);
                do
                {
                    chunk.Add(e.Current);
                } while (++count < chunkSize && e.MoveNext());
                yield return chunk;
                count = 0;
            }
        }
    }
}
