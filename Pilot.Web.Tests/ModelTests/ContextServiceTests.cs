using System;
using System.Collections.Generic;
using System.Text;
using Ascon.Pilot.Server.Api;
using Moq;
using NUnit.Framework;
using Pilot.Web.Model;
using Pilot.Web.Model.Auth;

namespace Pilot.Web.Tests.ModelTests
{
    class ContextServiceTests
    {
        [Test]
        public void should_get_server_api()
        {
            // given
            var connectionService = new Mock<IConnectionService>();
            var remoteServiceFactory = new Mock<IRemoteServiceFactory>();
            var service = new ContextService(connectionService.Object, remoteServiceFactory.Object);

            var sedovCreds = Credentials.GetConnectionCredentials("sedov", "passwrd1");
            var smithCreds = Credentials.GetConnectionCredentials("smith", "passwrd2");

            var sedovHttpClient = new HttpPilotClient("");
            var smithHttpClient = new HttpPilotClient("");
            connectionService.Setup(cs => cs.Connect(sedovCreds)).Returns(sedovHttpClient);
            connectionService.Setup(cs => cs.Connect(smithCreds)).Returns(smithHttpClient);

            var sedovApi = new Mock<IRemoteService>();
            var sedovServerApi = new Mock<IServerApiService>();
            sedovApi.Setup(sa => sa.IsActive).Returns(true);
            sedovApi.Setup(sa => sa.GetServerApi()).Returns(sedovServerApi.Object);
            var smithApi = new Mock<IRemoteService>();
            var smithServerApi = new Mock<IServerApiService>();
            smithApi.Setup(sma => sma.IsActive).Returns(true);
            smithApi.Setup(sma => sma.GetServerApi()).Returns(smithServerApi.Object);

            remoteServiceFactory.Setup(rsf => rsf.CreateRemoteService(sedovHttpClient)).Returns(sedovApi.Object);
            remoteServiceFactory.Setup(rsf => rsf.CreateRemoteService(smithHttpClient)).Returns(smithApi.Object);

            service.CreateContext(sedovCreds);
            service.CreateContext(smithCreds);

            // when
            var api = service.GetServerApi("sedov");

            // then
            Assert.NotNull(api);
            Assert.AreEqual(sedovServerApi.Object, api);

            // when
            var sapi = service.GetServerApi("smith");

            // then
            Assert.NotNull(sapi);
            Assert.AreEqual(smithServerApi.Object, sapi);
        }

        [Test]
        public void should_not_get_server_api_if_is_not_active()
        {
            // given
            var connectionService = new Mock<IConnectionService>();
            var remoteServiceFactory = new Mock<IRemoteServiceFactory>();
            var service = new ContextService(connectionService.Object, remoteServiceFactory.Object);
            var sedovCreds = Credentials.GetConnectionCredentials("sedov", "passwrd1");
            var sedovHttpClient = new HttpPilotClient("");
            connectionService.Setup(cs => cs.Connect(sedovCreds)).Returns(sedovHttpClient);

            var sedovApi = new Mock<IRemoteService>();
            var sedovServerApi = new Mock<IServerApiService>();
            sedovApi.Setup(sa => sa.IsActive).Returns(false); // is not active
            sedovApi.Setup(sa => sa.GetServerApi()).Returns(sedovServerApi.Object);
            remoteServiceFactory.Setup(rsf => rsf.CreateRemoteService(sedovHttpClient)).Returns(sedovApi.Object);
            service.CreateContext(sedovCreds);

            // when
            Assert.Throws<UnauthorizedAccessException>(() => service.GetServerApi("sedov"));
        }

        [Test]
        public void should_not_get_server_api_if_actor_not_registered()
        {
            // given
            var connectionService = new Mock<IConnectionService>();
            var remoteServiceFactory = new Mock<IRemoteServiceFactory>();
            var service = new ContextService(connectionService.Object, remoteServiceFactory.Object);

            // when
            Assert.Throws<UnauthorizedAccessException>(() => service.GetServerApi("sedov"));
        }

        [Test]
        public void should_create_context()
        {
            // given
            var connectionService = new Mock<IConnectionService>();
            var remoteServiceFactory = new Mock<IRemoteServiceFactory>();
            var service = new ContextService(connectionService.Object, remoteServiceFactory.Object);
            var sedovCreds = Credentials.GetConnectionCredentials("sedov", "passwrd1");
            var sedovHttpClient = new HttpPilotClient("");
            connectionService.Setup(cs => cs.Connect(sedovCreds)).Returns(sedovHttpClient);

            var sedovApi = new Mock<IRemoteService>();
            var sedovServerApi = new Mock<IServerApiService>();
            sedovApi.Setup(sa => sa.IsActive).Returns(true);
            sedovApi.Setup(sa => sa.GetServerApi()).Returns(sedovServerApi.Object);
            remoteServiceFactory.Setup(rsf => rsf.CreateRemoteService(sedovHttpClient)).Returns(sedovApi.Object);

            // when
            service.CreateContext(sedovCreds);

            // then
            connectionService.Verify(cs => cs.Connect(sedovCreds), Times.Once);
            remoteServiceFactory.Verify(rsf => rsf.CreateRemoteService(sedovHttpClient), Times.Once);
        }

        [Test]
        public void should_not_create_context_twice()
        {
            // given
            var connectionService = new Mock<IConnectionService>();
            var remoteServiceFactory = new Mock<IRemoteServiceFactory>();
            var service = new ContextService(connectionService.Object, remoteServiceFactory.Object);
            var sedovCreds = Credentials.GetConnectionCredentials("sedov", "passwrd1");
            var sedovHttpClient = new HttpPilotClient("");
            connectionService.Setup(cs => cs.Connect(sedovCreds)).Returns(sedovHttpClient);

            var sedovApi = new Mock<IRemoteService>();
            var sedovServerApi = new Mock<IServerApiService>();
            sedovApi.Setup(sa => sa.IsActive).Returns(true);
            sedovApi.Setup(sa => sa.GetServerApi()).Returns(sedovServerApi.Object);
            remoteServiceFactory.Setup(rsf => rsf.CreateRemoteService(sedovHttpClient)).Returns(sedovApi.Object);

            // when
            service.CreateContext(sedovCreds);
            service.CreateContext(sedovCreds);
            
            // then
            connectionService.Verify(cs => cs.Connect(sedovCreds), Times.Once);
            remoteServiceFactory.Verify(rsf => rsf.CreateRemoteService(sedovHttpClient), Times.Once);
        }

        [Test]
        public void should_dispose_api_service()
        {
            // given
            var connectionService = new Mock<IConnectionService>();
            var remoteServiceFactory = new Mock<IRemoteServiceFactory>();
            var service = new ContextService(connectionService.Object, remoteServiceFactory.Object);
            var sedovCreds = Credentials.GetConnectionCredentials("sedov", "passwrd1");
            var sedovHttpClient = new HttpPilotClient("");
            connectionService.Setup(cs => cs.Connect(sedovCreds)).Returns(sedovHttpClient);

            var sedovApi = new Mock<IRemoteService>();
            var sedovServerApi = new Mock<IServerApiService>();
            sedovApi.Setup(sa => sa.IsActive).Returns(true);
            sedovApi.Setup(sa => sa.GetServerApi()).Returns(sedovServerApi.Object);
            remoteServiceFactory.Setup(rsf => rsf.CreateRemoteService(sedovHttpClient)).Returns(sedovApi.Object);
            service.CreateContext(sedovCreds);

            // when
            service.RemoveContext("sedov");

            // then
            sedovApi.Verify(sa => sa.Dispose(), Times.Once);
        }
    }
}
