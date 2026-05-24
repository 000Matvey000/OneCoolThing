using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace fileParser
{
    public class X12File
    {
        // Properties specific to X12 files can be added here
        public string? SenderID { get; set; }
        public string? ReceiverID { get; set; }
        public string? ControlNumber { get; set; }
        public string? Version { get; set; }
        public string? FunctionalGroup { get; set; }
        public string? TransactionSet { get; set; }
        public string? TranDate { get; set; }
        public string? TranTime { get; set; }
        public string? GSFrom { get; set; }
        public string? GSTo { get; set; }
        public string? GSControlNumber { get; set; }
        public List<dynamic>? ParsedConfigData { get; set; }
        private List<X12ST>? STSegments { get; set; }
        public string FullPath { get; set; }
        public string ErrorDirectory { get; set; }
        public string FileName => Path.GetFileName(FullPath);

        


        // private string[] importantSegments = new string[] { "BIG", "W06" };

        private string x12FileConfigPath = "X12Config.json";

        private record X12ST
        {
            public required string ID { get; set; }
            public required string Document { get; set; }
        }




        // Configuration class to map JSON structure
        private record X12Config
        {
            public required string DocumentType { get; set; }
            public string[]? HeaderSummaryFields { get; set; }
            public string[]? DetailFields { get; set; }
        }

        private void ReadConfig()
        {
            // check if file exists
            if (!File.Exists(x12FileConfigPath))
            {
                throw new FileNotFoundException($"ERROR Configuration file not found: {x12FileConfigPath}");
            }

            JObject configJson = JObject.Parse(File.ReadAllText(x12FileConfigPath));
            var configs = configJson["X12Configs"]?.ToObject<List<X12Config>>();
            if (configs == null)
            {
                throw new Exception("ERROR Invalid configuration format.");
            }

            ParsedConfigData = new List<dynamic>();
            foreach (var config in configs)
            {
                ParsedConfigData.Add(new
                {
                    config.DocumentType,
                    config.HeaderSummaryFields,
                    config.DetailFields,
                });
            }

        }


        // Constructor
        public X12File(string fullpath, string errorPath)
           
        {
            FullPath = fullpath;
            ErrorDirectory = errorPath;
            
            ReadConfig();
            // Parse the X12 file to extract relevant information
            GetEnvelope();
            // validate Envelope data
            if (string.IsNullOrEmpty(SenderID) || string.IsNullOrEmpty(ReceiverID) || string.IsNullOrEmpty(ControlNumber) || string.IsNullOrEmpty(TransactionSet))
            {
                // move file to error directory
                string destPath = Path.Combine(ErrorDirectory, Path.GetFileName(FullPath));
                File.Move(FullPath, destPath);
                Console.WriteLine($"ERROR Invalid X12 file envelope. File moved to Error folder: {destPath}");
                Console.WriteLine($"  SenderID: {SenderID}, ReceiverID: {ReceiverID}, ControlNumber: {ControlNumber}, Version: {Version}, FunctionalGroup: {FunctionalGroup}, TransactionSet: {TransactionSet}");
            }
            GetSTSegments();
            if (STSegments == null || STSegments.Count == 0)
            {
                // move file to error directory
                string destPath = Path.Combine(ErrorDirectory, Path.GetFileName(FullPath));
                File.Move(FullPath, destPath);
                Console.WriteLine($"ERROR No ST segments found in X12 file. File moved to Error folder: {destPath}");
            }

        }

        // override display info method
        public void ProcessInfo()
        {
            Console.WriteLine("-------------------Config Check--------------------");
            if (ParsedConfigData != null)
            {
                foreach (var config in ParsedConfigData)
                {
                    Console.WriteLine($"  Document Type: {config.DocumentType}");
                    if (config.HeaderSummaryFields != null)
                    {
                        Console.WriteLine("    Header Fields: " + string.Join(", ", config.HeaderSummaryFields));
                    }
                    if (config.DetailFields != null)
                    {
                        Console.WriteLine("    Detail Fields: " + string.Join(", ", config.DetailFields));
                    }
                }
            }
            Console.WriteLine("--------------X12 File Specific Info-----------------");
            Console.WriteLine($"  Sender ID: {SenderID}");
            Console.WriteLine($"  Receiver ID: {ReceiverID}");
            Console.WriteLine($"  Control Number: {ControlNumber}");
            Console.WriteLine($"  Version: {Version}");
            Console.WriteLine($"  Functional Group: {FunctionalGroup}");
            Console.WriteLine($"  GS From: {GSFrom}");
            Console.WriteLine($"  GS To: {GSTo}");
            Console.WriteLine($"  GS Control Number: {GSControlNumber}");
            Console.WriteLine($"  Transaction Set: {TransactionSet}");
            Console.WriteLine($"  Transaction Date: {TranDate}");
            Console.WriteLine($"  Transaction Time: {TranTime}");
            Console.WriteLine("--------------------------------------------------");
            Console.WriteLine("Getting ST to SE data for each ST segment:");

            if (STSegments != null)
            {
                foreach (var st in STSegments)
                {

                    Console.WriteLine($"\nData for ST ID: {st.ID}, Document Type: {st.Document}");

                    var stData = GetSTtoSEData(st.ID);
                    foreach (var line in stData)
                    {

                        var extracted = ExtractElements(line, st.Document);
                        if (!string.IsNullOrEmpty(extracted))
                        {
                            // extractedData += extracted;
                            //Console.WriteLine(extracted);
                            // split extracted by |
                            var parts = extracted.Split('|', StringSplitOptions.RemoveEmptyEntries);
                            foreach (var part in parts)
                            {
                                // example output: BIG ,02 ,123456789 | segment, position, value
                                // split by comma
                                var subParts = part.Split(',');

                                // example output: BIG ,02 ,123456789 | segment, position, value
                                if (subParts.Length == 3)
                                {
                                    var segment = subParts[0].Trim();
                                    var position = subParts[1].Trim();
                                    var value = subParts[2].Trim();
                                    Console.WriteLine($"{FileName}, {st.ID}, {st.Document}, {segment}, {position}, {value},{SenderID}, {ReceiverID}, {ControlNumber},{Version}, {FunctionalGroup}, {TranDate}, {TranTime}, {GSControlNumber}, {GSFrom}, {GSTo}");

                                    // pass data to a method that will insert into a database
                                    SqlInterface.InsertX12Data(FileName, st.ID, st.Document, segment, position, value, SenderID ?? string.Empty, ReceiverID ?? string.Empty, ControlNumber ?? string.Empty, Version ?? string.Empty, FunctionalGroup ?? string.Empty, TranDate ?? string.Empty, TranTime ?? string.Empty, GSControlNumber ?? string.Empty, GSFrom ?? string.Empty, GSTo ?? string.Empty);
                                }
                                else
                                {
                                    throw new Exception($"ERROR Invalid extracted part format: {part}");
                                }

                            }
                        }
                    }
                    // Console.WriteLine(extractedData);
                }
            }

        } // end of DisplayInfo

        // method to extract elements from line based on config
        private string ExtractElements(string line, string documentType)
        {
            // find config for document type
            string result = "";
            var elements = line.Split('*'); // split line into elements
            if (elements.Length == 0) return "";
            var segmentId = elements[0].Trim(); // get segment identifier

            for (int i = 1; i < elements.Length; i++)
            {
                result += checkConfigAgainstLine(segmentId, documentType, i, elements[i]);
            }
            return result;
        }

        private string checkConfigAgainstLine(string segmentId, string documentType, int elementIndex, string elementValue)
        {
            // get config for document type
            if (ParsedConfigData == null) return "";
            var config = ParsedConfigData.Find(c => c.DocumentType == documentType);
            if (config == null) return "";

            // get array of fields to check from config
            var fieldsToCheck = new List<string>();
            if (config.HeaderSummaryFields != null)
            {
                fieldsToCheck.AddRange(config.HeaderSummaryFields);
            }
            if (config.DetailFields != null)
            {
                fieldsToCheck.AddRange(config.DetailFields);
            }
            foreach (var field in fieldsToCheck)
            {
                var parts = field.Split('-');
                if (parts.Length == 2)
                {
                    var seg = parts[0].Trim();
                    if (seg == segmentId)
                    {
                        if (int.TryParse(parts[1], out int idx))
                        {
                            if (idx == elementIndex)
                            {
                                // sql server compatible string
                                return $"{segmentId} ,{elementIndex} ,{elementValue.Replace("|", "").Replace(",", "").Replace("\n", "").Replace("\r", "").Replace("\t", "").Replace("'", "''")}|";
                            }
                        }
                    }
                }

            }
            return "";
        }

        // Method to parse the X12 file and extract information
        private void GetEnvelope()
        {
            using (var reader = new StreamReader(FullPath))
            {
                string? line;
                while ((line = reader.ReadLine()) != null)
                {
                    var segments = line.Split('*');
                    if (segments.Length > 0)
                    {
                        switch (segments[0])
                        {
                            case "ISA":
                                if (segments.Length >= 13)
                                {
                                    SenderID = segments[6].Trim();
                                    ReceiverID = segments[8].Trim();
                                    ControlNumber = segments[13].Trim();
                                    TranDate = segments[9].Trim();
                                    TranTime = segments[10].Trim();
                                }
                                break;
                            case "GS":
                                if (segments.Length >= 8)
                                {
                                    FunctionalGroup = segments[1].Trim();
                                    GSFrom = segments[2].Trim();
                                    GSTo = segments[3].Trim();
                                    Version = segments[8].Trim();
                                    GSControlNumber = segments[6].Trim();
                                }
                                break;
                            case "ST":
                                if (segments.Length >= 3)
                                {
                                    TransactionSet = segments[1].Trim();
                                }
                                break;
                        }
                    }
                }
            }
        } // end of GetEnvelope

        // get document ST segments

        private void GetSTSegments()
        {

            STSegments = new List<X12ST>();
            using (var reader = new StreamReader(FullPath))
            {
                string? line;
                while ((line = reader.ReadLine()) != null)
                {
                    var segments = line.Split('*');
                    if (segments.Length > 0 && segments[0] == "ST")
                    {
                        if (segments.Length >= 3)
                        {
                            if (STSegments == null)
                            {
                                STSegments = new List<X12ST>();
                            }
                            STSegments.Add(new X12ST
                            {
                                Document = segments[1].Trim(),
                                ID = segments[2].Trim()
                            });


                        }
                    }

                }

            }



        } // end of GetSTSegments

        // get data between ST and SE segments
        public List<string> GetSTtoSEData(string stId)
        {
            var data = new List<string>();
            bool capture = false;

            using (var reader = new StreamReader(FullPath))
            {
                string? line;
                while ((line = reader.ReadLine()) != null)
                {
                    var segments = line.Split('*');
                    if (segments.Length > 0)
                    {
                        if (segments[0] == "ST" && segments.Length >= 2 && segments[2].Trim() == stId)
                        {
                            capture = true;
                            continue; // Skip the ST line itself
                        }
                        else if (segments[0] == "SE" && capture)
                        {
                            break; // Stop capturing when SE is found
                        }

                        if (capture)
                        {
                            data.Add(line);
                        }
                    }
                }
            }

            return data;
        } // end of GetSTtoSEData


    } // end of class
}