$ErrorActionPreference = 'Stop'
$config = [IO.File]::ReadAllText((Join-Path $PSScriptRoot '.env'))
$match = [regex]::Match($config,'(?m)^DATABASE_URL=(.+)$')
if(!$match.Success){throw 'DATABASE_URL ayarı yok.'}
$dbUri = [uri]$match.Groups[1].Value.Trim()
$parts = $dbUri.UserInfo.Split(':',2)
$env:PGPASSWORD = [uri]::UnescapeDataString($parts[1])
$backupRoot = Join-Path $PSScriptRoot ('backups\'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
try {
  $pgDump = Join-Path $env:LOCALAPPDATA 'FoodWaste\postgresql\bin\pg_dump.exe'
  & $pgDump -h $dbUri.Host -p $dbUri.Port -U $parts[0] -d $dbUri.AbsolutePath.TrimStart('/') -Fc --no-owner --no-acl -f (Join-Path $backupRoot 'database.pgdump')
  if($LASTEXITCODE -ne 0){throw 'Veritabanı yedeği alınamadı.'}
  $docs = Join-Path $PSScriptRoot 'data\documents'
  if(Test-Path $docs){Copy-Item -LiteralPath $docs -Destination (Join-Path $backupRoot 'documents') -Recurse}
  Write-Output "Veritabanı ve belge yedeği oluşturuldu: $backupRoot"
} finally { $env:PGPASSWORD=$null }
