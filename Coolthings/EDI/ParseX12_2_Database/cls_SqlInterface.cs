// class to handle SQL interface
using Newtonsoft.Json.Linq;

namespace fileParser
{
    public static class SqlInterface
    {
        // get connection string from x12db.json file
        // read the file and get the connection string
        private static string RawconnectionString = File.ReadAllText("x12db.json");
        private static JObject json = JObject.Parse(RawconnectionString);
        private static readonly string connectionString = (string?)json["ConnectionStrings"]?["DefaultConnection"] ?? throw new InvalidOperationException("ERROR Connection string not found in x12db.json.");
        public static void InsertX12Data(string fileName, string stID, string document, string segment, string position, string value, string senderID, string receiverID, string controlNumber, string version = "", string functionalGroup = "", string tranDate = "", string tranTime = "", string gsControlNumber = "", string gsFrom = "", string gsTo = "")
        {
            using (Microsoft.Data.SqlClient.SqlConnection conn = new Microsoft.Data.SqlClient.SqlConnection(connectionString))
            {
                string query = "INSERT INTO X12_Staging (FileName, STID, Document, Segment, Position, Value, SenderID, ReceiverID, ControlNumber, Version, FunctionalGroup, TranDate, TranTime, CreatedAt, UpdatedAt, IsProcessed, GSControlNumber, GSFrom, GSTo) " +
                               "VALUES (@FileName, @STID, @Document, @Segment, @Position, @Value, @SenderID, @ReceiverID, @ControlNumber, @Version, @FunctionalGroup, @TranDate, @TranTime, @CreatedAt, @UpdatedAt, @IsProcessed, @GSControlNumber, @GSFrom, @GSTo)";

                using (Microsoft.Data.SqlClient.SqlCommand cmd = new Microsoft.Data.SqlClient.SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@FileName", fileName);
                    cmd.Parameters.AddWithValue("@STID", stID);
                    cmd.Parameters.AddWithValue("@Document", document);
                    cmd.Parameters.AddWithValue("@Segment", segment);
                    cmd.Parameters.AddWithValue("@Position", position);
                    cmd.Parameters.AddWithValue("@Value", value);
                    cmd.Parameters.AddWithValue("@SenderID", senderID);
                    cmd.Parameters.AddWithValue("@ReceiverID", receiverID);
                    cmd.Parameters.AddWithValue("@ControlNumber", controlNumber);
                    cmd.Parameters.AddWithValue("@Version", version);
                    cmd.Parameters.AddWithValue("@FunctionalGroup", functionalGroup);
                    cmd.Parameters.AddWithValue("@TranDate", tranDate);
                    cmd.Parameters.AddWithValue("@TranTime", tranTime);
                    cmd.Parameters.AddWithValue("@CreatedAt", DateTime.Now);
                    cmd.Parameters.AddWithValue("@UpdatedAt", DateTime.Now);
                    cmd.Parameters.AddWithValue("@IsProcessed", false);
                    cmd.Parameters.AddWithValue("@GSControlNumber", gsControlNumber);
                    cmd.Parameters.AddWithValue("@GSFrom", gsFrom);
                    cmd.Parameters.AddWithValue("@GSTo", gsTo);

                    conn.Open();
                    cmd.ExecuteNonQuery();
                }
            }
        }
    }
}