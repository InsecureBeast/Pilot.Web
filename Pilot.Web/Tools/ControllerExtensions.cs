using System;
using Ascon.Pilot.Transport;
using log4net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Pilot.Web.Tools
{
    public static class ControllerExtensions
    {
        private static readonly ILog _logger = LogManager.GetLogger(typeof(ControllerExtensions));
        public static ActionResult Run<T>(this ControllerBase controller, Func<T> func)
        {
            try
            {
                var res = func();
                return controller.Ok(res);
            }
            catch (UnauthorizedAccessException e)
            {
                _logger.Error(e);
                return controller.Unauthorized(e.Message);
            }
            catch (TransportException e)
            {
                _logger.Error(e);
                return new ServiceUnavailableObjectResult(e.Message);
            }
            catch (Exception e)
            {
                _logger.Error(e);
                return controller.BadRequest(e.Message);
            }
        }

        public static ActionResult Run(this ControllerBase controller, Action action)
        {
            try
            {
                action();
                return controller.Ok();
            }
            catch (UnauthorizedAccessException e)
            {
                _logger.Error(e);
                return controller.Unauthorized(e.Message);
            }
            catch (TransportException e)
            {
                _logger.Error(e);
                return new ServiceUnavailableObjectResult(e.Message);
            }
            catch (Exception e)
            {
                _logger.Error(e);
                return controller.BadRequest(e.Message);
            }
        }

        public static ActionResult RunFile(this ControllerBase controller, Func<byte[]> func, string contentType)
        {
            try
            {
                var res = func();
                return controller.File(res, contentType);
            }
            catch (UnauthorizedAccessException e)
            {
                _logger.Error(e);
                return controller.Unauthorized(e.Message);
            }
            catch (TransportException e)
            {
                _logger.Error(e);
                return new ServiceUnavailableObjectResult(e.Message);
            }
            catch (Exception e)
            {
                _logger.Error(e);
                return controller.BadRequest(e.Message);
            }
        }
    }

    /// <summary>
    /// An <see cref="T:Microsoft.AspNetCore.Mvc.ObjectResult" /> that when executed will produce a Unavailable Entity (422) response.
    /// </summary>
    [Microsoft.AspNetCore.Mvc.Infrastructure.DefaultStatusCode(503)]
    public class ServiceUnavailableObjectResult : ObjectResult
    {
        private const int DefaultStatusCode = 503;

        /// <summary>
        /// Creates a new <see cref="T:Microsoft.AspNetCore.Mvc.ServiceUnavailableObjectResult" /> instance.
        /// </summary>
        /// <param name="modelState"><see cref="T:Microsoft.AspNetCore.Mvc.ModelBinding.ModelStateDictionary" /> containing the validation errors.</param>
        public ServiceUnavailableObjectResult(ModelStateDictionary modelState): this(new SerializableError(modelState))
        {
        }

        /// <summary>
        /// Creates a new <see cref="T:Microsoft.AspNetCore.Mvc.ServiceUnavailableObjectResult" /> instance.
        /// </summary>
        /// <param name="error">Contains errors to be returned to the client.</param>
        public ServiceUnavailableObjectResult(object error) : base(error)
        {
            StatusCode = 503;
        }
    }
}
