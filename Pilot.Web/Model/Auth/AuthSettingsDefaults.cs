using System;
using System.Text;
using J2N;
using Microsoft.IdentityModel.Tokens;

namespace Pilot.Web.Model.Auth
{
    [Serializable]
    public class AuthSettings
    {
        public string Issuer { get; set; } // издатель токена
        public string SecretKey { get; set; } // ключ для шифрации
        public int TokenLifeTimeDays { get; set; } // время жизни токена

        public string GetAudience()
        {
            return "http://localhost:51884/"; // потребитель токена
        }

        public TimeSpan GetClockCrew()
        {
            return TimeSpan.Zero;
        }

        public DateTime? GetTokenLifetime(int days)
        {
            return DateTime.UtcNow.AddDays(days); // время жизни токена - 2 дня
        }

        public SymmetricSecurityKey GetSymmetricSecurityKey()
        {
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
        }
    }
}
