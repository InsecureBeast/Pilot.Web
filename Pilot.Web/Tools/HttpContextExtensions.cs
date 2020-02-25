using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Http;

namespace Pilot.Web.Tools
{
    public static class HttpContextExtensions
    {
        public static string GetTokenActor(this HttpContext httpContext)
        {
            httpContext.Request.Headers.TryGetValue("Authorization", out var tokenSource);
            if (string.IsNullOrEmpty(tokenSource))
                return null;

            var token = tokenSource.ToString().Replace("Bearer ", "");
            var jwtToken = new JwtSecurityToken(token);
            return jwtToken.Actor;
        }
    }
}
