using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using log4net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Pilot.Web.Model;
using Pilot.Web.Model.Auth;
using Pilot.Web.Tools;

namespace Pilot.Web.Controllers
{
    public class User
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(AuthController));
        private readonly IContextService _contextService;

        public AuthController(IContextService contextService)
        {
            _contextService = contextService;
        }

        [HttpPost("[action]")]
        public ActionResult SignIn([FromBody]User user)
        {
            try
            {
                var credentials = Credentials.GetConnectionCredentials(user.Username, user.Password);
                _contextService.CreateContext(credentials);
                var tokenString = CreateToken(credentials);
                _logger.Info($"Signed in successfully. Username: {user.Username}.");
                return Ok(new { Token = tokenString });
            }
            catch (Exception e)
            {
                _logger.Info($"Signed in failed. Username: {user.Username}.");
                _logger.Error(e);
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
                _logger.Info($"Signed out successfully. Username: {actor}.");
                return Ok();
            }
            catch (Exception e)
            {
                _logger.Info($"Signed out failed.");
                _logger.Error(e);
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