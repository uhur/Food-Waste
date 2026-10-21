export function validateRecord(r) {
  if (!r || typeof r.lot !== 'string' || !r.lot.trim() || typeof r.product !== 'string' || !r.product.trim()) throw new Error('Parti ve ürün zorunludur.');
  if(r.lot.length>100||r.product.length>150)throw new Error('Parti kodu en fazla 100, ürün adı en fazla 150 karakter olabilir.');
  if (!Number.isFinite(Number(r.quantity)) || Number(r.quantity) <= 0) throw new Error('Miktar sıfırdan büyük olmalı.');
  if (!['kg','adet','litre'].includes(r.unit)) throw new Error('Geçersiz birim.');
  if (typeof r.issue !== 'string' || !r.issue.trim()) throw new Error('Uygunsuzluk açıklaması zorunludur.');
  if(r.issue.length>3000)throw new Error('Açıklama en fazla 3000 karakter olabilir.');
}
export function validateDecision(record, d) {
  if (record.decision) throw new Error('Karar zaten kaydedildi.');
  if (!['Yeniden işleme','İade','Atığa ayırma','Diğer'].includes(d.type) || typeof d.reason!=='string' || !d.reason.trim() || d.reason.length>3000) throw new Error('Karar türü ve en fazla 3000 karakterlik gerekçe zorunludur.');
}
export function validateDelivery(record, d) {
  if(record.decision?.type !== 'Atığa ayırma' || record.delivery) throw new Error('Bu kayıt teslime uygun değil.');
  if(!d.receiver?.trim() || !d.reference?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(d.date || '') || !Number.isFinite(Date.parse(d.date))) throw new Error('Alıcı, tarih ve belge referansı zorunludur.');
  if(new Date(d.date).toISOString().slice(0,10)!==d.date)throw new Error('Geçerli bir takvim tarihi girin.');
  if(!Number.isFinite(Number(d.quantity)) || Number(d.quantity) <= 0 || Number(d.quantity) > record.quantity) throw new Error('Teslim miktarı parti miktarını aşamaz.');
  if(Number(d.quantity) !== record.quantity) throw new Error('İlk sürüm yalnızca tam miktar teslimini destekler.');
}
