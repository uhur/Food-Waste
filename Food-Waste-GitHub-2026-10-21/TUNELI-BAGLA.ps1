param([switch]$ValidateOnly)
$ErrorActionPreference='Stop'
$taskRoot=$PSScriptRoot
$taskBin=Join-Path $taskRoot '.local\tunnel-client\bin\tunnel-client.exe'
$taskProfiles=Join-Path $taskRoot '.local\tunnel-client\profiles'
$taskSecretPath=Join-Path $taskRoot '.local\tunnel-client\credential.dpapi'
$taskStatePath=Join-Path $taskRoot '.local\tunnel-client\setup-state.json'
$taskDiagnosticPath=Join-Path $taskRoot '.local\tunnel-client\setup-diagnostics.log'
function Write-TaskState([string]$phase){@{phase=$phase;at=[DateTime]::UtcNow.ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath $taskStatePath -Encoding utf8}
function Invoke-TaskClient([string[]]$ClientArguments){
  $taskLines=& $taskBin @ClientArguments 2>&1
  $taskExit=$LASTEXITCODE
  $taskSafe=($taskLines -join [Environment]::NewLine)
  if($env:CONTROL_PLANE_API_KEY){$taskSafe=$taskSafe.Replace($env:CONTROL_PLANE_API_KEY,'[ANAHTAR GİZLENDİ]')}
  $taskSafe=$taskSafe -replace 'sk-[A-Za-z0-9_-]+','[ANAHTAR GİZLENDİ]'
  Add-Content -LiteralPath $taskDiagnosticPath -Value $taskSafe -Encoding utf8
  return $taskExit
}
if(!(Test-Path -LiteralPath $taskBin)){throw 'Resmî tünel istemcisi kurulmamış.'}
if($ValidateOnly){'Yerel tünel başlatıcı dosyaları hazır.';exit 0}
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$taskKey=$null
if(Test-Path -LiteralPath $taskSecretPath){$taskKey=Get-Content -LiteralPath $taskSecretPath -Raw | ConvertTo-SecureString}
if(!$taskKey){
  Write-TaskState 'Anahtar girişi bekleniyor'
  $taskForm=[System.Windows.Forms.Form]::new()
  $taskForm.Text='Food & Waste - Özel tüneli bağla'
  $taskForm.ClientSize=[System.Drawing.Size]::new(590,300)
  $taskForm.StartPosition='CenterScreen'
  $taskForm.FormBorderStyle='FixedDialog'
  $taskForm.MaximizeBox=$false
  $taskForm.MinimizeBox=$false
  $taskLabel=[System.Windows.Forms.Label]::new()
  $taskLabel.SetBounds(22,20,545,92)
  $taskLabel.Text="OpenAI Platform'da kendi oluşturduğunuz çalışma anahtarını buraya yapıştırın. Anahtar sohbet veya günlük çıktısına yazılmaz. Food & Waste tüneli için kullanılır; ana uygulamanız internete açılmaz."
  $taskLabel.Font=[System.Drawing.Font]::new('Segoe UI',10)
  $taskBox=[System.Windows.Forms.TextBox]::new()
  $taskBox.SetBounds(22,116,545,30)
  $taskBox.UseSystemPasswordChar=$true
  $taskBox.Font=[System.Drawing.Font]::new('Segoe UI',11)
  $taskRemember=[System.Windows.Forms.CheckBox]::new()
  $taskRemember.SetBounds(22,159,545,48)
  $taskRemember.Text='İsteğe bağlı: Anahtarı bu Windows hesabıyla şifreleyerek bu cihazda sakla.'
  $taskRemember.Checked=$false
  $taskConnect=[System.Windows.Forms.Button]::new()
  $taskConnect.Text='Tüneli bağla'
  $taskConnect.SetBounds(304,234,125,36)
  $taskConnect.DialogResult=[System.Windows.Forms.DialogResult]::OK
  $taskCancel=[System.Windows.Forms.Button]::new()
  $taskCancel.Text='İptal'
  $taskCancel.SetBounds(442,234,125,36)
  $taskCancel.DialogResult=[System.Windows.Forms.DialogResult]::Cancel
  $taskForm.Controls.AddRange(@($taskLabel,$taskBox,$taskRemember,$taskConnect,$taskCancel))
  $taskForm.AcceptButton=$taskConnect
  $taskForm.CancelButton=$taskCancel
  try{
    if($taskForm.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK){Write-TaskState 'Kullanıcı iptal etti';exit 0}
    if($taskBox.Text -notmatch '^sk-\S{20,}$'){throw 'OpenAI çalışma anahtarı geçerli biçimde değil. Anahtarı sohbete göndermeyin.'}
    $taskKey=ConvertTo-SecureString $taskBox.Text -AsPlainText -Force
    $taskBox.Clear()
    if($taskRemember.Checked){$taskKey | ConvertFrom-SecureString | Set-Content -LiteralPath $taskSecretPath -Encoding ascii}
  }finally{$taskForm.Dispose()}
}
$taskPointer=[System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskKey)
try{$env:CONTROL_PLANE_API_KEY=[System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPointer)}
finally{[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPointer);$taskKey.Dispose()}
try{
  Write-TaskState 'Bağlantı denetleniyor'
  $taskCode=Invoke-TaskClient @('doctor','--profile','foodwaste','--profile-dir',$taskProfiles,'--explain')
  if($taskCode -ne 0){throw 'Tünel denetimi geçmedi. Anahtarın organizasyonu ve Tunnels Read + Use yetkisi kontrol edilmeli.'}
  Write-TaskState 'Yönetilen tünel başlatılıyor'
  $taskCode=Invoke-TaskClient @('runtimes','connect','--alias','foodwaste','--profile','foodwaste','--profile-dir',$taskProfiles,'--tunnel-id','YOUR_TUNNEL_ID','--mcp-server-url','http://127.0.0.1:3102/mcp','--runtime-api-key','env:CONTROL_PLANE_API_KEY','--json')
  if($taskCode -ne 0){throw 'Yönetilen tünel başlatılamadı.'}
  $taskCode=Invoke-TaskClient @('runtimes','status','foodwaste','--json')
  if($taskCode -ne 0){throw 'Tünel durumu doğrulanamadı.'}
  Write-TaskState 'Başlatma tamamlandı; hazır durumu ayrıca doğrulanmalı'
  [System.Windows.Forms.MessageBox]::Show('Tünel başlatma adımı tamamlandı. Sohbete dönüp hazır yazın; bağlantı ve beş araç ayrıca doğrulanacak.','Food & Waste') | Out-Null
}catch{
  Write-TaskState 'Bağlantı tamamlanamadı; temizlenmiş tanılama kaydı incelenmeli'
  [System.Windows.Forms.MessageBox]::Show($_.Exception.Message,'Food & Waste bağlantısı tamamlanmadı') | Out-Null
  throw
}finally{Remove-Item Env:CONTROL_PLANE_API_KEY -ErrorAction SilentlyContinue}
