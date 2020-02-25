using System;
using System.Collections.Generic;
using System.Linq;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Model
{
    /// <summary>
    /// Predefined filters for IDataObject.Children
    /// </summary>
    public static class ChildrenFilters
    {
        /// <summary>
        /// Gets child object identifiers filtered for list view
        /// </summary>
        /// <param name="obj">object</param>
        /// <param name="repository">repository</param>
        /// <returns>Object identifiers</returns>
        public static IEnumerable<Guid> GetChildrenForListView(this DObject obj, IServerApiService repository)
        {
            return GetChildrenByTypePredicate(obj, repository, MatchesListView);
        }

        private static bool MatchesListView(INType type)
        {
            if (type.Name == SystemTypes.SMART_FOLDER)
                return true;
            if (type.Name == SystemTypes.SHORTCUT)
                return true;
            return !type.IsService && type.Kind == TypeKind.User;
        }

        public static IEnumerable<Guid> GetChildrenForPilotStorage(this DObject obj, IServerApiService repository)
        {
            return GetChildrenByTypePredicate(obj, repository, MatchesPilotStorage);
        }

        public static IEnumerable<DChild> GetStorageChildren(this DObject obj, IServerApiService repository)
        {
            return obj.Children.Where(x => MatchesPilotStorage(repository.GetType(x.TypeId)));
        }

        private static bool MatchesPilotStorage(INType type)
        {
            return type.Name == SystemTypes.PROJECT_FOLDER || type.Name == SystemTypes.PROJECT_FILE;
        }

        /// <summary>
        /// Gets child object identifiers filtered by type names
        /// </summary>
        /// <param name="obj">object</param>
        /// <param name="repository">repository</param>
        /// <param name="typeNames">type names to filter by</param>
        /// <returns>Object identifiers</returns>
        public static IEnumerable<Guid> GetChildrenByTypeNames(this DObject obj, IServerApiService repository, params string[] typeNames)
        {
            return GetChildrenByTypePredicate(obj, repository, t => typeNames.Contains(t.Name));
        }

        private static IEnumerable<Guid> GetChildrenByTypePredicate(DObject obj, IServerApiService repository, Predicate<INType> predicate)
        {
            return obj.Children.Where(x => predicate(repository.GetType(x.TypeId))).Select(x => x.ObjectId);
        }
    }
}
