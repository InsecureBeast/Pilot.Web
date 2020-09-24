using System;
using System.ServiceModel;
using System.ServiceModel.Security;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using Pilot.Web.Controllers;
using Pilot.Web.Model;
using Pilot.Web.Model.Auth;

namespace Pilot.Web.Tests
{
    public class AuthControllerTests
    {
        [SetUp]
        public void Setup()
        {
        }

        [Test]
        public void should_sign_up()
        {
            // given
            var contextService = new Mock<IContextService>();
            var settings = new AuthSettings
            {
                SecretKey = "fwj'oeijf[aeofhuewhfe",
                Issuer = "Issuer"
            };
            var options = new Mock<IOptions<AuthSettings>>();
            options.Setup(o => o.Value).Returns(settings);
            var controller = new AuthController(contextService.Object, options.Object);
            
            // when
            var user = new User
            {
                Username = "sedov",
                Password = "password"
            };

            var result = controller.SignIn(user) as OkObjectResult;

            // then
            Assert.NotNull(result);
            Assert.AreEqual(200, result.StatusCode);
            contextService.Verify(cs => cs.CreateContext(It.IsAny<Credentials>()), Times.Once);
        }

        [Test]
        public void should_not_sign_up()
        {
            // given
            var contextService = new Mock<IContextService>();
            var settings = new AuthSettings
            {
                SecretKey = "fwj'oeijf[aeofhuewhfe",
                Issuer = "Issuer"
            };
            var options = new Mock<IOptions<AuthSettings>>();
            options.Setup(o => o.Value).Returns(settings);
            var controller = new AuthController(contextService.Object, options.Object);

            // when
            contextService.Setup(cs => cs.CreateContext(It.IsAny<Credentials>()))
                .Throws<Exception>();
            var user = new User
            {
                Username = "sedov",
                Password = "password"
            };

            var result = controller.SignIn(user) as BadRequestObjectResult;

            // then
            Assert.NotNull(result);
            Assert.AreEqual(400, result.StatusCode);
        }

        [Test]
        public void should_sign_out()
        {
            // given
            var contextService = new Mock<IContextService>();
            var options = new Mock<IOptions<AuthSettings>>();
            var controller = new AuthController(contextService.Object, options.Object);

            // when
            contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            var result = controller.SignOut() as OkResult;

            // then
            Assert.NotNull(result);
            Assert.AreEqual(200, result.StatusCode);
            contextService.Verify(cs => cs.RemoveContext("sedov"), Times.Once);
        }

        [Test]
        public void should_sign_return_ok_if_actor_not_found()
        {
            // given
            var contextService = new Mock<IContextService>();
            var options = new Mock<IOptions<AuthSettings>>();
            var controller = new AuthController(contextService.Object, options.Object);

            // when
            var result = controller.SignOut() as OkResult;

            // then
            Assert.NotNull(result);
            Assert.AreEqual(200, result.StatusCode);
            contextService.Verify(cs => cs.RemoveContext("sedov"), Times.Never);
        }

        [Test]
        public void should_sign_out_return_bad_request_if_something_goes_wrong()
        {
            // given
            var contextService = new Mock<IContextService>();
            var options = new Mock<IOptions<AuthSettings>>();
            var controller = new AuthController(contextService.Object, options.Object);

            // when
            contextService.Setup(hs => hs.GetTokenActor(It.IsAny<HttpContext>())).Returns("sedov");
            contextService.Setup(cs => cs.RemoveContext("sedov")).Throws<Exception>();
            var result = controller.SignOut() as BadRequestObjectResult;

            // then
            Assert.NotNull(result);
            Assert.AreEqual(400, result.StatusCode);
        }
    }
}