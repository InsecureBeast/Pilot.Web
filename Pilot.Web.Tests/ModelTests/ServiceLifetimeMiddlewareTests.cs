using System;
using System.Collections.Generic;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Moq;
using NUnit.Framework;
using Pilot.Web.Model;
using Pilot.Web.Model.Middleware;

namespace Pilot.Web.Tests.ModelTests
{
    class ServiceLifetimeMiddlewareTests
    {
        [Test]
        public void should_remove_context_if_a_user_is_inactive()
        {
            // given
            var contextService = new Mock<IContextService>();
            var timeoutProvider = new Mock<IIdleSessionTimeoutProvider>();
            timeoutProvider.Setup(s => s.GetIdleTimeout()).Returns(TimeSpan.FromSeconds(3));
            timeoutProvider.Setup(s => s.GetTimerTicks()).Returns(5000);
            var middleware = new ServiceLifetimeMiddleware(context => Task.CompletedTask, contextService.Object, timeoutProvider.Object);
            
            // when
            var httpContext = new Mock<HttpContext>();
            var request = new Mock<HttpRequest>();
            httpContext.Setup(hc => hc.Request).Returns(request.Object);
            contextService.Setup(c => c.GetTokenActor(httpContext.Object)).Returns("sedov");

            Task.Factory.StartNew(() => { middleware.Invoke(httpContext.Object); });
            Thread.Sleep(TimeSpan.FromSeconds(10));
            
            // then
            contextService.Verify(cs => cs.RemoveContext("sedov"), Times.Once);
        }

        [Test]
        public void should_not_remove_context_if_a_user_is_active()
        {
            // given
            var contextService = new Mock<IContextService>();
            var timeoutProvider = new Mock<IIdleSessionTimeoutProvider>();
            timeoutProvider.Setup(s => s.GetIdleTimeout()).Returns(TimeSpan.FromSeconds(10));
            timeoutProvider.Setup(s => s.GetTimerTicks()).Returns(2);
            var middleware = new ServiceLifetimeMiddleware(context => Task.CompletedTask, contextService.Object, timeoutProvider.Object);

            // when
            var httpContext = new Mock<HttpContext>();
            var request = new Mock<HttpRequest>();
            httpContext.Setup(hc => hc.Request).Returns(request.Object);
            contextService.Setup(c => c.GetTokenActor(httpContext.Object)).Returns("sedov");

            Task.Factory.StartNew(() =>
            {
                middleware.Invoke(httpContext.Object);
                Thread.Sleep(TimeSpan.FromSeconds(1));
                middleware.Invoke(httpContext.Object);
                Thread.Sleep(TimeSpan.FromSeconds(1));
                middleware.Invoke(httpContext.Object);
            });
            Thread.Sleep(TimeSpan.FromSeconds(10));

            // then
            contextService.Verify(cs => cs.RemoveContext("sedov"), Times.Never);
        }
    }
}
