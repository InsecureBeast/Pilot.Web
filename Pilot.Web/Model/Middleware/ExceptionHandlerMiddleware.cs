using System;
using System.Threading.Tasks;
using Ascon.Pilot.Transport;
using log4net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace Pilot.Web.Model.Middleware
{
    public sealed class ExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        //private readonly ILogger<ExceptionHandlerMiddleware> _logger;
        private readonly ILog _logger = LogManager.GetLogger(typeof(ExceptionHandlerMiddleware));
        public ExceptionHandlerMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (TransportException e)
            {
                _logger.Info(e.Message);
                context.Response.StatusCode = 503; //Service Unavailable
                await context.Response.WriteAsync("Pilot-Server is unavailable");
            }
            catch (UnauthorizedAccessException e)
            {
                _logger.Info(e.Message);
                context.Response.StatusCode = 401; //Unauthorized
                await context.Response.WriteAsync(e.Message);
            }
            catch (Exception e)
            {
                _logger.Error(e);
                context.Response.StatusCode = 500; //Internal error
                var result = JsonConvert.SerializeObject(new { error = e.Message });
                await context.Response.WriteAsync(result);
            }
        }
    }

    public static class ExceptionHandlerMiddlewareExtensions
    {
        public static IApplicationBuilder UseExceptionHandlerMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ExceptionHandlerMiddleware>();
        }
    }
}
