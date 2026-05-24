namespace fileParser
{
    public static class X12Helper
    {
        public static string? DelimiterType { get; set; }
        public static int ISA_Count { get; set; } = 0;


        // Call this method to determine and set the delimiter type
        public static void HelpX12File(string FullPath, string ToBeProcessedPath, string archivePath)
        {
            // check valid file path
            if (string.IsNullOrWhiteSpace(FullPath) || !File.Exists(FullPath))
            {
                throw new ArgumentException("Invalid file path provided for delimiter check.");
            }
            // archive original file with timestamp
            DateTime now = DateTime.Now;
            string timestamp = now.ToString("yyyyMMdd_HHmmss");
            string fileName = Path.GetFileNameWithoutExtension(FullPath);
            string fileExtension = Path.GetExtension(FullPath);
            string archivedFileName = $"{fileName}_{timestamp}{fileExtension}";
            string archivedFilePath = Path.Combine(archivePath, archivedFileName);
            // Archive the original file
            File.Copy(FullPath, archivedFilePath, true);
            Console.WriteLine($"Original file archived to: {archivedFilePath}");


            DelimiterType = GetLineDelimiterType(false, FullPath);

            // If the delimiter is tilde, convert it to CRLF
            if (DelimiterType == "Tilde (~)")
            {
                ConvertTildeToCRLF(FullPath);
                // Re-evaluate the delimiter type after conversion
                DelimiterType = GetLineDelimiterType(true, FullPath);
            }
            // Count ISA segments
            ISA_Count = Count_ISA(FullPath);
            Console.WriteLine($"Delimiter Type: {DelimiterType}, ISA Count: {ISA_Count}");
            // if more than 1 split into multiple files, otherwise move to ToBeProcessedPath as is
            if (ISA_Count > 1)
            {
                SplitFileByISA(FullPath, ToBeProcessedPath);
                Console.WriteLine($"File split into {ISA_Count} files based on ISA segments.");
                // list files in ToBeProcessedPath
                var files = Directory.GetFiles(ToBeProcessedPath);
                Console.WriteLine("Moved Files to ToBeProcessed folder:");
                foreach (var file in files)
                {
                    Console.WriteLine($" - {file}");
                }
            }
            else
            {
                // move file to ToBeProcessedPath
                DateTime dt = DateTime.Now;
                string ts = dt.ToString("yyyyMMdd_HHmmss");
                string destPath = Path.Combine(ToBeProcessedPath, $"{fileName}_{ts}{fileExtension}");
                File.Move(FullPath, destPath);
                Console.WriteLine($"File moved to ToBeProcessed folder: {destPath}");
            }
        }

        // check for line delimiter type
        public static string GetLineDelimiterType(bool recheck = false, string FullPath = "")
        {
            string rechecked = recheck ? " (replaced from ~)" : "";
            // Read the first few characters to detect line endings
            using (var fileStream = new FileStream(FullPath, FileMode.Open, FileAccess.Read))
            using (var reader = new StreamReader(fileStream))
            {
                char[] buffer = new char[1024]; // Read first 1024 characters
                int bytesRead = reader.Read(buffer, 0, buffer.Length);

                if (bytesRead > 0)
                {
                    string content = new string(buffer, 0, bytesRead);

                    // Check for CRLF first (most specific)
                    if (content.Contains("\r\n"))
                    {
                        if (recheck)
                            return "CRLF" + rechecked;
                        else
                            return "CRLF";
                    }
                    // Then check for LF
                    else if (content.Contains("\n"))
                    {
                        return "LF";
                    }
                    // Finally check for CR
                    else if (content.Contains("\r"))
                    {
                        return "CR";
                    }
                    else if (content.Contains("~"))
                    {
                        return "Tilde (~)";
                    }
                }

                return "Unknown";
            }
        } // end of GetLineDelimiterType

        // convert ~ to CRLF
        public static void ConvertTildeToCRLF(string FullPath = "")
        {
            string tempFilePath = FullPath + ".tmp";

            using (var reader = new StreamReader(FullPath))
            using (var writer = new StreamWriter(tempFilePath))
            {
                string? line;
                while ((line = reader.ReadLine()) != null)
                {
                    // Replace tilde with CRLF
                    line = line.Replace("~", "\r\n");
                    writer.WriteLine(line);
                }
            }

            // Replace original file with the modified file
            File.Delete(FullPath);
            File.Move(tempFilePath, FullPath);
        }


        // Check if there are multiple ISA segments
        public static int Count_ISA(string FullPath)
        {
            int isaCount = 0;

            using (var reader = new StreamReader(FullPath))
            {
                string? line;
                while ((line = reader.ReadLine()) != null)
                {
                    if (line.StartsWith("ISA"))
                    {
                        isaCount++;
                    }
                }
            }

            ISA_Count = isaCount;
            return isaCount;

        } // end of Count_ISA


        // if there are multiple ISA segments, split into multiple files
        public static void SplitFileByISA(string FullPath, string ToBeProcessedPath)
        {
            using (var reader = new StreamReader(FullPath))
            {
                string? line;
                int fileIndex = 1; // To differentiate between multiple files
                DateTime now = DateTime.Now;
                string timestamp = now.ToString("yyyyMMdd_HHmmss");
                StreamWriter? writer = null;

                while ((line = reader.ReadLine()) != null)
                {
                    if (line.StartsWith("ISA"))
                    {
                        // Close previous writer if exists
                        writer?.Close();

                        // Create a new file for the new ISA segment
                        string newFilePath = Path.Combine(ToBeProcessedPath, $"X12_Part{fileIndex}_{timestamp}.txt");
                        writer = new StreamWriter(newFilePath);
                        fileIndex++;
                    }

                    // Write the line to the current file
                    writer?.WriteLine(line);
                }
                // Close the last writer if exists
                writer?.Close();
            }
        }
    }
}