using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SQLite;
using System.Globalization;
using log4net;

namespace Pilot.Web.Model.Bim.Database
{
    public class DatabaseCreator
    {
        public void CreateModelPartDatabase(string filename)
        {
            using (var connection = new DatabaseConnector().Connect(filename))
            {
                var hasSchema = HasSchema(connection);
                if (!hasSchema)
                    ApplySchema(CreateModelPartDatabaseScript, connection);
            }
        }

        private void ApplySchema(string databaseScript, SQLiteConnection connection)
        {
            using (var command = new SQLiteCommand(databaseScript, connection))
            {
                command.CommandType = CommandType.Text;
                command.ExecuteNonQuery();
            }
        }

        private string CreateModelPartDatabaseScript =>
            @"
            CREATE TABLE [nodes] (
                [object_id] GUID,
                [revision] TEXT,
                [version_id] GUID NOT NULL,
                [parent_id] GUID,
                [name] TEXT,
                [type] TEXT,
                [data] TEXT,
                [placement] BLOB,
                PRIMARY KEY (object_id, revision)
            ) WITHOUT ROWID;

            CREATE TABLE [tessellations] (
              [id] GUID PRIMARY KEY, 
              [object_id] GUID, 
              [revision] TEXT, 
              [data] BLOB
            ) WITHOUT ROWID;

            CREATE INDEX [1] ON [tessellations]([object_id]);
            CREATE INDEX [2] ON [tessellations]([object_id], [revision]);
            ";

        private bool HasSchema(SQLiteConnection connection)
        {
            using (var schema = connection.GetSchema("Tables"))
            {
                return schema.Rows.Count > 0;
            }
        }
    }
}
