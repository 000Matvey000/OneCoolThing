using System;

namespace fileParser
{

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("File Parser Application Starting...");
            Console.WriteLine($"Number of args: {args.Length}");
            Console.WriteLine("Args:");
            foreach (var arg in args)
            {
                Console.WriteLine($"Arg: {arg}");
            }
            if (args.Length != 7)
            {
                Console.WriteLine("Usage: fileParser <filePath> <fileName> <fileType> <toBeProcessedPath> <archivePath> <errorPath> <processedPath>");
                return;
            }
            try
            {
                // get the file info
                FileObject file = new FileObject(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);

                file.DisplayInfo();
                // if X12 file, parse it
                if (file.FileType.ToUpper() == "X12")
                {
                    X12Helper.HelpX12File(file.FullPath, file.ToBeProcessedPath, file.ArchivePath);

                    // iterate through files in ToBeProcessedPath and process them
                    var files = Directory.GetFiles(file.ToBeProcessedPath);
                    foreach (var f in files)
                    {
                        Console.WriteLine($"Processing file: {f}");
                        X12File x12File = new X12File(f, file.ErrorPath);

                        x12File.ProcessInfo();
                        // if processing is successful, move processed file to ProcessedPath with timestamp
                        if (File.Exists(f))
                        {
                            Console.WriteLine($"File processed successfully: {f}");
                            DateTime dt = DateTime.Now;
                            string ts = dt.ToString("yyyyMMdd_HHmmss");
                            string fileName = Path.GetFileNameWithoutExtension(f);
                            string fileExtension = Path.GetExtension(f);
                            string destPath = Path.Combine(file.ProcessedPath, $"{fileName}_{ts}{fileExtension}");
                            File.Move(f, destPath);
                            Console.WriteLine($"File moved to Processed folder: {destPath}");
                        }
                        else
                        // this probably won't fire because if there was an error, the file would have been moved to Error folder
                        {
                            Console.WriteLine($"File not found after processing (may have been moved to Error folder): {f}");
                            continue; // skip moving to Processed folder if file doesn't exist
                        }

                    }


                    // X12File x12File = new X12File(file.FilePath, file.FileName, file.FileType, file.ToBeProcessedPath, file.ArchivePath, file.ErrorPath, file.ProcessedPath);
                    // x12File.ProcessInfo();
                }
                else
                {
                    Console.WriteLine("ERROR File type not supported for parsing.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR : {ex.Message}");
            }
        }
    }
}