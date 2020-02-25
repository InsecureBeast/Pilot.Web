using System;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Pilot.Web.Model.Auth
{
    public class AuthOptions
    {
        public const string ISSUER = "PilotWebUssuer"; // издатель токена
        public const string AUDIENCE = "http://localhost:51884/"; // потребитель токена
        const string KEY = "SecretKey@30824995-BD42-4850-87ED-EE8A2AE06ACA";   // ключ для шифрации
        public static DateTime? LIFETIME = DateTime.UtcNow.AddDays(2); // время жизни токена - 2 дня
        public static TimeSpan CLOCK_CREW = TimeSpan.Zero;// TimeSpan.FromDays(2);

        public static SymmetricSecurityKey GetSymmetricSecurityKey()
        {
            return new SymmetricSecurityKey(Encoding.ASCII.GetBytes(KEY));
        }
    }
}
