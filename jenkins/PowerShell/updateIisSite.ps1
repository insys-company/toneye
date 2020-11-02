Param($username_remote_machine, $password_remote_machine, $wwwpath, $archive_name, $remote_archive_directory, $ip_remote_server, $seven_zip_remote_directory, $site_name)
$ErrorActionPreference = "Stop"

$pw = convertto-securestring -AsPlainText -Force -String $password_remote_machine
$cred = new-object -typename System.Management.Automation.PSCredential -argumentlist $username_remote_machine, $pw

$Commands = {
Param($wwwpath, $archive_name, $remote_archive_directory, $seven_zip_remote_directory, $site_name)

#This script is deploy project from Azure storage.
$DestinationFolder = "$remote_archive_directory\$archive_name"
$InetsrvDir = $env:windir + "\System32\inetsrv"

#Stop IIS site.
Set-Location $InetsrvDir
& .\appcmd.exe stop site "/site.name:$site_name"
& .\appcmd.exe stop apppool "/apppool.name:$site_name"

#Execute archive.
Set-Location $seven_zip_remote_directory
.\7z.exe x -r "$DestinationFolder" "-o$wwwpath" -aoa

#Start IIS site.
Set-Location $InetsrvDir
& .\appcmd.exe start site "/site.name:$site_name"
& .\appcmd.exe start apppool "/apppool.name:$site_name"
}

$so = New-PsSessionOption -SkipCACheck -SkipCNCheck
Invoke-Command $ip_remote_server -SessionOption $so -ScriptBlock $Commands -Credential $cred -ArgumentList $wwwpath, $archive_name, $remote_archive_directory, $seven_zip_remote_directory, $site_name