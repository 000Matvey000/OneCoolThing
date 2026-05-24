// file object class

namespace fileParser
{

    public class FileObject
    {
        public string FilePath { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public string FullPath { get { return Path.Combine(FilePath, FileName); } }

        public string ToBeProcessedPath { get; set; }
        public string ArchivePath { get; set; }
        public string ErrorPath { get; set; }
        public string ProcessedPath { get; set; }




        // Constructor
        public FileObject(string filePath, string fileName, string fileType, string toBeProcessedPath, string archivePath, string errorPath, string processedPath)
        {

            ToBeProcessedPath = toBeProcessedPath;
            ArchivePath = archivePath;
            ErrorPath = errorPath;
            ProcessedPath = processedPath;

            // validate inputs
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be null or empty.");
            if (string.IsNullOrWhiteSpace(fileName))
                throw new ArgumentException("File name cannot be null or empty.");
            if (string.IsNullOrWhiteSpace(fileType))
                throw new ArgumentException("File type cannot be null or empty.");

            if (filePath == ".")
            {
                FilePath = Environment.CurrentDirectory;
            }
            else
            {
                FilePath = filePath;
            }

            FileName = fileName;

            // check if file exists in directory

            if (!File.Exists(FullPath))
            {
                throw new FileNotFoundException($"The file '{FullPath}' does not exist.");
            }

            FileType = fileType;

            // check if toBeProcessedPath, archivePath, errorPath, processedPath exist, if not, throw error
            if (!Directory.Exists(ToBeProcessedPath))
                throw new DirectoryNotFoundException($"To be processed directory '{ToBeProcessedPath}' does not exist.");
            if (!Directory.Exists(ArchivePath))
                throw new DirectoryNotFoundException($"Archive directory '{ArchivePath}' does not exist.");
            if (!Directory.Exists(ErrorPath))
                throw new DirectoryNotFoundException($"Error directory '{ErrorPath}' does not exist.");
            if (!Directory.Exists(ProcessedPath))
                throw new DirectoryNotFoundException($"Processed directory '{ProcessedPath}' does not exist.");
        }
        // Method to display file information
        public void DisplayInfo()
        {
            Console.WriteLine("---------------- File Information ----------------");
            Console.WriteLine($"File Path: {FilePath}");
            Console.WriteLine($"File Name: {FileName}");
            Console.WriteLine($"File Type: {FileType}");
            Console.WriteLine($"Full Path: {FullPath}");
            Console.WriteLine($"File Size: {new FileInfo(FullPath).Length} bytes");
            Console.WriteLine($"Created On: {File.GetCreationTime(FullPath)}");
            Console.WriteLine($"Last Modified: {File.GetLastWriteTime(FullPath)}");
            Console.WriteLine($"To Be Processed Path: {ToBeProcessedPath}");
            Console.WriteLine($"Archive Path: {ArchivePath}");
            Console.WriteLine($"Error Path: {ErrorPath}");
            Console.WriteLine($"Processed Path: {ProcessedPath}");
            Console.WriteLine("--------------------------------------------------");
            // get environment information
            Console.WriteLine($"Current Directory: {Environment.CurrentDirectory}");
            Console.WriteLine($"Machine Name: {Environment.MachineName}");
            Console.WriteLine($"User Name: {Environment.UserName}");
            Console.WriteLine("--------------------------------------------------");
        } // end of DisplayInfo



    } // end of class
}