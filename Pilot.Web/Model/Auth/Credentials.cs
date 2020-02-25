using Ascon.Pilot.Common;

namespace Pilot.Web.Model.Auth
{
    public class Credentials
    {
        public string Username { get; private set; }
        public string ProtectedPassword { get; private set; }
        public bool UseWindowsAuth => !string.IsNullOrEmpty(Username) && (Username.Contains("\\") || Username.Contains("@"));
        
        public static Credentials GetConnectionCredentials(string username, string password)
        {
            var credentials = new Credentials
            {
                Username = username,
                ProtectedPassword = password.EncryptAes(),
            };

            return credentials;
        }
    }
}
