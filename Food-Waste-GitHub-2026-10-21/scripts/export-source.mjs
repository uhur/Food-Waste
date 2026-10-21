import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(root, 'exports', 'food-waste-source');
const excluded = new Set(['.git', '.local', '.agents', '.codex', '.aws', 'node_modules', 'data', 'backups', 'test-results', 'exports']);
const textExtensions = new Set(['.mjs', '.js', '.css', '.html', '.json', '.webmanifest', '.md', '.ps1', '.cmd', '.yaml', '.yml', '.svg']);
const assetExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.ico']);
const manifest = [];

async function collect(directory, prefix = '') {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (item.isSymbolicLink() || excluded.has(item.name)) continue;
    const relative = path.posix.join(prefix, item.name);
    const source = path.join(directory, item.name);
    if (item.isDirectory()) { await collect(source, relative); continue; }
    const extension = path.extname(item.name).toLowerCase();
    const special = ['.env.example', '.gitignore', 'pnpm-lock.yaml'].includes(item.name);
    if ((!special && !textExtensions.has(extension) && !assetExtensions.has(extension)) || (item.name.startsWith('.env') && item.name !== '.env.example')) continue;
    let bytes = await readFile(source);
    if (special || textExtensions.has(extension)) {
      let content = bytes.toString('utf8');
      content = content.replace(/plugin_asdk_app_[a-f0-9]{20,}/g, 'YOUR_PLUGIN_ID')
        .replace(/tunnel_(?:ext\d+_)?[a-z0-9]{20,}/g, 'YOUR_TUNNEL_ID')
        .replace(/org-[A-Za-z0-9]{15,}/g, 'YOUR_ORGANIZATION_ID')
        .replace(/C:\\Users\\uadiy/g, 'C:\\Users\\YOUR_USER')
        .replace(/C:\/Users\/uadiy/g, 'C:/Users/YOUR_USER');
      const scanContent = content.replaceAll('YOUR_PASSWORD', '').replaceAll('$appSecret', '');
      if (/sk-[A-Za-z0-9_-]{16,}/.test(content) || /postgres(?:ql)?:\/\/[^\s:@]+:[^\s@]+@/.test(scanContent)) {
        throw new Error(`Possible credential: ${relative}`);
      }
      bytes = Buffer.from(content);
    }
    const target = path.join(destination, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
    manifest.push({ file: relative, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
}

await collect(root);
await writeFile(path.join(destination, 'SOURCE-MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ directory: destination, files: manifest.length, totalBytes: manifest.reduce((sum, entry) => sum + entry.bytes, 0) }));
