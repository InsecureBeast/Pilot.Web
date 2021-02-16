﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ascon.Pilot.DataClasses;
using Ascon.Pilot.Server.Api.Contracts;

namespace Pilot.Web.Model
{
    public interface IRemoteServiceListener
    {
        void Notify(DMetadataChangeset changeset);
        void Notify(OrganisationUnitChangeset changeset);
        void Notify(PersonChangeset changeset);
        void UpdateCommandResult(Guid requestId, byte[] data, ServerCommandResult result);
    }

    public interface IRemoteSearchServiceListener
    {
        void Notify(DSearchResult result);
    }

    public class ServerCallback : IServerCallback
    {
        private IRemoteServiceListener _listener;
        private IRemoteSearchServiceListener _searchListener;

        public void RegisterCallbackSearchListener(IRemoteSearchServiceListener listener)
        {
            _searchListener = listener;
        }

        public void RegisterCallbackListener(IRemoteServiceListener listener)
        {
            _listener = listener;
        }

        public void NotifyChangeset(DChangeset changeset)
        {
        }

        public void NotifyDMetadataChangeset(DMetadataChangeset changeset)
        {
            _listener?.Notify(changeset);
        }

        public void NotifyDNotificationChangeset(DNotificationChangeset changeset)
        {
        }

        public void NotifyCommandResult(Guid requestId, byte[] data, ServerCommandResult result)
        {
            _listener.UpdateCommandResult(requestId, data, result);
        }

        public void NotifyGeometrySearchResult(DGeometrySearchResult searchResult)
        {
        }

        public void NotifyOrganisationUnitChangeset(OrganisationUnitChangeset changeset)
        {
            _listener?.Notify(changeset);
        }

        public void NotifyPersonChangeset(PersonChangeset changeset)
        {
            _listener?.Notify(changeset);
        }

        public void NotifySearchResult(DSearchResult searchResult)
        {
            _searchListener?.Notify(searchResult);
        }
    }
}
