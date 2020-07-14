using Microsoft.AspNetCore.Builder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Pilot.Web.Model.Auth;
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
        private readonly int _timerDueTime = (int)TimeSpan.FromMinutes(1).TotalMilliseconds;

        public ServiceLifetimeMiddleware(RequestDelegate next, IContextService contextService, IOptions<AuthSettings> authSettings)
        {
            _next = next;
            _contextService = contextService;
            _timer = new Timer(TimerTick, null, _timerDueTime, _timerDueTime);
            _renewalTime = TimeSpan.FromMinutes(authSettings.Value.IdleSessionTimeout);
        }

        public Task Invoke(HttpContext context)
        {
            if (context.Request.Path == "/api/Auth/SignOut")
                return _next.Invoke(context);

            lock (_contextTable)
            {
                var actor = context.GetTokenActor();
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
