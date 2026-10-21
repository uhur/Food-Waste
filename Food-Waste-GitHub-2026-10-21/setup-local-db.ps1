$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$sourceRuntime = Join-Path $projectRoot '.local\postgresql\pgsql'
$runtimeRoot = Join-Path $env:LOCALAPPDATA 'FoodWaste\postgresql'
if (!(Test-Path (Join-Path $runtimeRoot 'bin\initdb.exe'))) {
  if (!(Test-Path (Join-Path $sourceRuntime 'bin\initdb.exe'))) { throw 'Önce resmî PostgreSQL Windows paketini .local/postgresql içine çıkarın.' }
  New-Item -ItemType Directory -Path (Split-Path $runtimeRoot) -Force | Out-Null
  Copy-Item -LiteralPath $sourceRuntime -Destination $runtimeRoot -Recurse
}
$bin = Join-Path $runtimeRoot 'bin'
$dbRoot = Join-Path $env:LOCALAPPDATA 'FoodWaste\postgres-data'
$configPath = Join-Path $projectRoot '.env'
if (Test-Path (Join-Path $dbRoot 'PG_VERSION')) {
  & (Join-Path $bin 'pg_ctl.exe') -D $dbRoot status
  if ($LASTEXITCODE -ne 0) { & (Join-Path $bin 'pg_ctl.exe') -D $dbRoot -l (Join-Path $dbRoot 'server.log') -o '-p 5433 -h 127.0.0.1' start }
  Write-Output 'Mevcut yerel PostgreSQL kümesi kullanılıyor. .env kimlik bilgileri değiştirilmedi.'
  exit
}
New-Item -ItemType Directory -Path (Split-Path $dbRoot) -Force | Out-Null
$adminSecret = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$appSecret = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$secretPath = Join-Path $projectRoot '.local\pg-init-secret'
[IO.File]::WriteAllText($secretPath, $adminSecret)
try {
  & (Join-Path $bin 'initdb.exe') -D $dbRoot -U fwadmin --auth=scram-sha-256 --encoding=UTF8 --locale=C --pwfile=$secretPath
  if ($LASTEXITCODE -ne 0) { throw 'initdb başarısız.' }
  & (Join-Path $bin 'pg_ctl.exe') -D $dbRoot -l (Join-Path $dbRoot 'server.log') -o '-p 5433 -h 127.0.0.1' start
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL başlatılamadı.' }
  $env:PGPASSWORD = $adminSecret
  & (Join-Path $bin 'psql.exe') -h 127.0.0.1 -p 5433 -U fwadmin -d postgres -v ON_ERROR_STOP=1 -c "CREATE ROLE fwapp LOGIN PASSWORD '$appSecret' NOSUPERUSER NOCREATEDB NOCREATEROLE;"
  if ($LASTEXITCODE -ne 0) { throw 'Uygulama rolü oluşturulamadı.' }
  & (Join-Path $bin 'createdb.exe') -h 127.0.0.1 -p 5433 -U fwadmin -O fwapp foodwaste
  if ($LASTEXITCODE -ne 0) { throw 'Veritabanı oluşturulamadı.' }
  $config = if(Test-Path $configPath){[IO.File]::ReadAllText($configPath)}else{"PORT=3100`nOLLAMA_MODEL=qwen3:8b`n"}
  $config = [regex]::Replace($config, '(?m)^DATABASE_URL=.*\r?\n?', '')
  $config = [regex]::Replace($config, '(?m)^OLLAMA_VISION_MODEL=.*\r?\n?', '')
  [IO.File]::WriteAllText($configPath, $config.TrimEnd()+"`nOLLAMA_VISION_MODEL=qwen3-vl:4b`nDATABASE_URL=postgresql://fwapp:$appSecret@127.0.0.1:5433/foodwaste`n")
  [IO.File]::WriteAllText((Join-Path $projectRoot '.local\pg-admin-secret'),$adminSecret)
  Write-Output 'Yerel PostgreSQL hazır. Uygulama parolası gösterilmeden .env dosyasına yazıldı.'
} finally {
  $env:PGPASSWORD = $null
  if(Test-Path -LiteralPath $secretPath){Remove-Item -LiteralPath $secretPath}
}
