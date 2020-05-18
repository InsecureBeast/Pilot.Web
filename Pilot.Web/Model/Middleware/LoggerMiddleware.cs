using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using log4net;
using Microsoft.AspNetCore.Http;

namespace Pilot.Web.Model.Middleware
{
    public sealed class LoggerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILog _logger = LogManager.GetLogger(typeof(LoggerMiddleware));

        public LoggerMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            await _next(context);

        }
    }
}
