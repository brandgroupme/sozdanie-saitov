import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'docs');
const files = readdirSync(dist).filter(name => name.endsWith('.html') && name !== 'qa.html');
let links = 0;
for (const name of files) {
  const path = join(dist, name), html = readFileSync(path, 'utf8');
  assert.match(html, /<html lang="ru"/);
  assert.match(html, /name="viewport"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${name}: one h1`);
  assert(!/href="#"[ >]/.test(html), `${name}: no dead href`);
  assert(!/\b(?:sk-proj-|sk-live-|api_key\s*[:=])/i.test(html), `${name}: no client secrets`);
  for (const match of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
    const url = match[1];
    if (/^(https?:|tel:|data:)/.test(url)) continue;
    const [filePart, hash] = url.split('#');
    const local = filePart.split('?')[0].replace(/^\/sozdanie-saitov\//, '/');
    const target = local ? resolve(local.startsWith('/') ? dist : dirname(path), local.replace(/^\//, '')) : path;
    assert(existsSync(target), `${name}: missing ${url}`);
    if (hash && target.endsWith('.html')) assert(readFileSync(target, 'utf8').includes(`id="${hash}"`), `${name}: missing anchor ${url}`);
    links++;
  }
}
for (const script of ['app.js', 'direction.js', 'config.js']) execFileSync(process.execPath, ['--check', join(dist, script)]);
const manifest = JSON.parse(readFileSync(join(dist, 'asset-manifest.json'), 'utf8'));
assert.equal(manifest.paid_generations, 0);
assert.equal(manifest.assets.length, 6);
for (const asset of manifest.assets) {
  assert(existsSync(join(dist, asset.path)));
  const svg = readFileSync(join(dist, asset.path), 'utf8');
  assert(!/<script|<foreignObject|https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg', '')), `unsafe SVG ${asset.id}`);
}
const app = readFileSync(join(dist, 'app.js'), 'utf8');
assert.equal((app.match(/requestAnimationFrame\(/g) || []).length, 1, 'single RAF entry');
assert(!/rotateY\(|Audio\(|\.play\(/.test(app), 'no simulated 3D or unapproved sound');
assert(!/fetch\([^)]*,\s*\{\s*method:\s*['"]POST/.test(app), 'no fake lead submission');
const size = readdirSync(dist, { recursive:true }).reduce((sum,name) => {const p=join(dist,name);return sum+(statSync(p).isFile()?statSync(p).size:0)},0);
console.log(JSON.stringify({result:'PASS',htmlPages:files.length,localReferencesChecked:links,svgAssets:manifest.assets.length,singleRAF:true,totalBytes:size}));
