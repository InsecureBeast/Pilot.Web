using Microsoft.AspNetCore.Builder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Pilot.Web.Tools;

namespace Pilot.Web.Model.Middleware
{
    public class ServiceLifetimeMiddleware : IDisposable
    {
        private readonly RequestDelegate _next;
        private readonly IContextService _contextService;
        private readonly Timer _timer;
        private readonly TimeSpan _renewalTime;
        private readonly Dictionary<string, long> _contextTable = new Dictionary<string, long>();

        public ServiceLifetimeMiddleware(RequestDelegate next, IContextService contextService, IIdleSessionTimeoutProvider sessionTimeoutProvider)
        {
            _next = next;
            _contextService = contextService;
            var timerDueTime = sessionTimeoutProvider.GetTimerTicks();
            _timer = new Timer(TimerTick, null, timerDueTime, timerDueTime);
            _renewalTime = sessionTimeoutProvider.GetIdleTimeout();
        }

        public Task Invoke(HttpContext context)
        {
            if (context.Request.Path == "/api/Auth/SignOut")
                return _next.Invoke(context);

            lock (_contextTable)
            {
                var actor = _contextService.GetTokenActor(context);
                if (!string.IsNullOrEmpty(actor))
                    _contextTable[actor] = DateTime.UtcNow.Ticks;
            }
            
            return _next.Invoke(context);
        }

        private void TimerTick(object state)
        {
            foreach (var (token, timespan) in _contextTable.ToArray())
            {
                var current = DateTime.UtcNow.Ticks;
                if (current - timespan < _renewalTime.Ticks)
                    continue;

                _contextTable.Remove(token);
                _contextService.RemoveContext(token);
            }
        }

        public void Dispose()
        {
            _timer.Change(Timeout.Infinite, Timeout.Infinite);
            _timer.Dispose();

            foreach (var context in _contextTable)
            {
                _contextService.RemoveContext(context.Key);
            }
            _contextTable.Clear();
        }
    }

    public static class ServiceLifetimeMiddlewareExtensions
    {
        public static IApplicationBuilder UseServiceLifetimeMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ServiceLifetimeMiddleware>();
        }
    }
}
