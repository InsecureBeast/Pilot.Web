using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ascon.Pilot.Server.Api;

namespace Pilot.Web.Model
{
    interface IRemoteServiceFactory
    {
        IRemoteService CreateRemoteService(HttpPilotClient client);
    }

    class RemoteServiceFactory : IRemoteServiceFactory
    {
        public IRemoteService CreateRemoteService(HttpPilotClient client)
        {
            return new RemoteService(client);
        }
    }
}
