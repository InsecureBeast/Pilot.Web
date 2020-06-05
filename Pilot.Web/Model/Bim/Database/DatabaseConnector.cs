using System;
using System.Data.SQLite;
using log4net;

namespace Pilot.Web.Model.Bim.Database
{
    public class DatabaseConnector
    {
        private SQLiteConnection _connection;
        private static readonly ILog Logger = LogManager.GetLogger(typeof(DatabaseConnector));

        public SQLiteConnection Connect(string filePath)
        {
            var factory = new SQLiteFactory();
            _connection = (SQLiteConnection)factory.CreateConnection();

            if (_connection == null)
                throw new SQLiteException("Error creating SQLiteConnection");
            try
            {
                var options = GetConnectionStringBuilder(filePath);
                _connection.ConnectionString = options.ConnectionString + ";Foreign Keys=True;";
                _connection.Open();

                using (var command = new SQLiteCommand(_connection)
                {
                    CommandText = "PRAGMA foreign_keys = ON;"
                })
                    command.ExecuteNonQuery();

                using (var command = new SQLiteCommand(_connection)
                {
                    CommandText = "PRAGMA synchronous = NORMAL;"
                })
                    command.ExecuteNonQuery();


                return _connection;
            }
            catch (Exception ex)
            {
                Logger.Fatal("Connect", ex);
                _connection.Dispose();
                throw;
            }
        }

        private static SQLiteConnectionStringBuilder GetConnectionStringBuilder(string dataSource)
        {
            var options = new SQLiteConnectionStringBuilder
            {
                DataSource = dataSource,
                PageSize = 4096, //Set page size to NTFS cluster size = 4096 bytes
                CacheSize = 10000,
                JournalMode = SQLiteJournalModeEnum.Wal,
                SetDefaults = false,
                DateTimeKind = DateTimeKind.Utc
            };

            return options;
        }
    }
}
