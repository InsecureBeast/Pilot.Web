using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Model.Search.NextTasksSearchExpression
{
    public interface ITaskTypesService
    {
        INType RootType { get; }
        List<INType> RootTaskTypes { get; }
        List<INType> RootWorkflowTypes { get; }
        List<INType> AllTaskTypes { get; }
        List<INType> AllWorkflowTypes { get; }
        List<INType> AllStageTypes { get; }

        INType GetStageType(INType workflowType);
        IEnumerable<INType> GetStageTaskTypes(INType stageType);
        IEnumerable<INType> GetSubTaskTypes(INType type);
        IEnumerable<INType> GetSubWorkflowTypes(INType type);
    }

    public class TaskTypesService : ITaskTypesService
    {
        private readonly IReadOnlyDictionary<int, INType> _types;

        public TaskTypesService(IReadOnlyDictionary<int, INType> types)
        {
            _types = types;

            RootType = _types.Values.FirstOrDefault(x => x.Name.Equals(SystemTypes.TASKS_ROOT_TYPE_NAME, StringComparison.OrdinalIgnoreCase));
            var rootTypes = RootType != null ? GetTypes(RootType.Children).ToList() : new List<INType>();
            RootTaskTypes = rootTypes.Where(t => t.IsTaskType()).ToList();
            RootWorkflowTypes = rootTypes.Where(t => t.IsWorkflowType()).ToList();

            var taskSet = new HashSet<INType>();
            var workflowSet = new HashSet<INType>();
            var stageSet = new HashSet<INType>();

            if (RootType != null)
                GetAllTypes(RootType, taskSet, workflowSet, stageSet);

            AllTaskTypes = taskSet.ToList();
            AllWorkflowTypes = workflowSet.ToList();
            AllStageTypes = stageSet.ToList();
        }

        public INType RootType { get; }
        public List<INType> RootTaskTypes { get; }
        public List<INType> RootWorkflowTypes { get; }
        public List<INType> AllTaskTypes { get; }
        public List<INType> AllWorkflowTypes { get; }
        public List<INType> AllStageTypes { get; }

        public INType GetStageType(INType workflowType)
        {
            var childrenTypes = GetTypes(workflowType.Children).ToList();
            var stageType = childrenTypes.FirstOrDefault(t => t.IsWorkflowStageType());
            return stageType;
        }

        public IEnumerable<INType> GetStageTaskTypes(INType stageType)
        {
            return GetTaskTypes(stageType);
        }

        public IEnumerable<INType> GetSubTaskTypes(INType type)
        {
            return GetTaskTypes(type);
        }

        public IEnumerable<INType> GetSubWorkflowTypes(INType type)
        {
            var childrenTypes = GetTypes(type.Children).ToList();
            var workflowTypes = childrenTypes.Where(t => t.IsWorkflowType());
            return workflowTypes;
        }

        private IEnumerable<INType> GetTaskTypes(INType type)
        {
            if (type == null)
                return Enumerable.Empty<INType>();

            var childrenTypes = GetTypes(type.Children).ToList();
            var taskTypes = childrenTypes.Where(t => t.IsTaskType());
            return taskTypes;
        }

        private void GetAllTypes(INType type, HashSet<INType> taskSet, HashSet<INType> workflowSet, HashSet<INType> stageSet)
        {
            var childrenTypes = GetTypes(type.Children).ToList();
            foreach (var childrenType in childrenTypes)
            {
                if (taskSet.Contains(childrenType) || workflowSet.Contains(childrenType))
                    continue;

                if (childrenType.IsWorkflowType())
                    workflowSet.Add(childrenType);

                if (childrenType.IsTaskType())
                    taskSet.Add(childrenType);
                if (childrenType.IsWorkflowStageType())
                    stageSet.Add(childrenType);

                GetAllTypes(childrenType, taskSet, workflowSet, stageSet);
            }
        }

        private IEnumerable<INType> GetTypes(IEnumerable<int> ids)
        {
            return ids.Select(x => _types[x]);
        }
    }
}
