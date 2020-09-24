using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Pilot.Web.Tools;

namespace Pilot.Web.Model
{
    public interface IHttpContextService
    {
        string GetTokenActor(HttpContext httpContext);
    }

    class HttpContextService : IHttpContextService
    {
        public string GetTokenActor(HttpContext httpContext)
        {
            return httpContext.GetTokenActor();
        }
    }
}
