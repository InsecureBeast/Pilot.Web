using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Pilot.Web.Model.Auth;

namespace Pilot.Web.Model.Middleware
{
    public interface IIdleSessionTimeoutProvider
    {
        TimeSpan GetIdleTimeout();
        int GetTimerTicks();
    }

    class IdleSessionTimeoutProvider : IIdleSessionTimeoutProvider
    {
        private readonly IOptions<AuthSettings> _authSettings;

        public IdleSessionTimeoutProvider(IOptions<AuthSettings> authSettings)
        {
            _authSettings = authSettings;
        }

        public TimeSpan GetIdleTimeout()
        {
            return TimeSpan.FromMinutes(_authSettings.Value.IdleSessionTimeout);
        }

        public int GetTimerTicks()
        {
            return (int) TimeSpan.FromMinutes(1).TotalMilliseconds;
        }
    }
}
