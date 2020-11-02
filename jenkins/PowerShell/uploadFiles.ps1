Param ($archive_path, $archive_name, $ip_remote_server, $username_remote_machine, $password_remote_machine, $remote_archive_directory)
$ErrorActionPreference = "Stop"

$archive = "$archive_path\$archive_name"

$pw = convertto-securestring -AsPlainText -Force -String $password_remote_machine
$cred = new-object -typename System.Management.Automation.PSCredential -argumentlist $username_remote_machine, $pw
$so = New-PsSessionOption -SkipCACheck -SkipCNCheck
$session = New-PSSession -ComputerName $ip_remote_server -Credential $cred -SessionOption $so -Verbose

$createFolder = {
    Param($remote_archive_directory)
    
    if (!(Test-Path($remote_archive_directory)))
    {
        New-Item -ItemType Directory -Path $remote_archive_directory
    }
}

# Create a remote directory if it doesnt exist
Invoke-Command $ip_remote_server -SessionOption $so -ScriptBlock $createFolder -Credential $cred -ArgumentList $remote_archive_directory

# Upload an archive to server
Copy-Item -Path $archive -Destination $remote_archive_directory -Recurse -Force -ToSession $session -Verbose