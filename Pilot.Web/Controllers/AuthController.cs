using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Pilot.Web.Model;
using Pilot.Web.Model.Auth;
using Pilot.Web.Tools;

namespace Pilot.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IContextService _contextService;

        public AuthController(IContextService contextService)
        {
            _contextService = contextService;
        }

        [HttpGet("[action]")]
        public ActionResult SignIn([FromHeader]string username, [FromHeader]string password)
        {
            try
            {
                var credentials = Credentials.GetConnectionCredentials(username, password);
                _contextService.CreateContext(credentials);
                var tokenString = CreateToken(credentials);
                return Ok(new { Token = tokenString });
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("[action]")]
        [Authorize]
        public ActionResult SignOut()
        {
            try
            {
                var actor = HttpContext.GetTokenActor();
                _contextService.RemoveContext(actor);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
        
        private static string CreateToken(Credentials credentials)
        {
            var secretKey = AuthOptions.GetSymmetricSecurityKey();
            var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(RegisteredClaimNames.Username, credentials.Username),
                //new Claim(RegisteredClaimNames.Data, credentials.ProtectedPassword),
                //new Claim(RegisteredClaimNames.Win, credentials.UseWindowsAuth.ToString())
            };

            var tokeOptions = new JwtSecurityToken(
                claims: claims,
                expires: AuthOptions.LIFETIME,
                signingCredentials: signinCredentials,
                audience: AuthOptions.AUDIENCE,
                issuer: AuthOptions.ISSUER
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokeOptions);
            return tokenString;
        }
    }
}