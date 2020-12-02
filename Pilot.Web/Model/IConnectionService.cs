using Ascon.Pilot.Server.Api;
using Microsoft.Extensions.Options;
using Pilot.Web.Model.Auth;

namespace Pilot.Web.Model
{
    internal interface IConnectionService
    {
        HttpPilotClient Connect(Credentials credentials);
    }

    class ConnectionService : IConnectionService
    {
        private readonly ServerSettings _config;

        public ConnectionService(IOptions<ServerSettings> config)
        {
            _config = config.Value;
        }

        public HttpPilotClient Connect(Credentials credentials)
        {
            var client = new HttpPilotClient(_config.Url);
            // Do not check versions of the Server and Client
            client.Connect(false);

            var authApi = client.GetAuthenticationApi();
            authApi.Login(_config.Database, credentials.Username, credentials.ProtectedPassword, credentials.UseWindowsAuth, _config.LicenseCode);
            return client;
        }
    }
}
