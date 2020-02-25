namespace Pilot.Web.Model
{
    public class ServerSettings
    {
        public string Url { get; set; }
        public string Database { get; set; }
        public int LicenseCode { get; set; }
    }

    public class AppSettings
    {
        public string FilesStorageDirectory { get; set; }
    }
}