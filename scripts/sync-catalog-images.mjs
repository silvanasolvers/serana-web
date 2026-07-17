import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { createClient } from '@supabase/supabase-js';

const execFileAsync = promisify(execFile);
const PROJECT_ORIGIN = 'https://tjjrnpwwfvmsukfrfchr.supabase.co';
const BUCKET = 'productos';
const PUBLIC_BASE = `${PROJECT_ORIGIN}/storage/v1/object/public/${BUCKET}`;
const resumeExisting = process.env.RESUME_EXISTING === '1';

function readEnvFile(filePath) {
  return readFile(filePath, 'utf8').then((contents) =>
    Object.fromEntries(
      contents
        .split(/\r?\n/)
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
          const separator = line.indexOf('=');
          const key = line.slice(0, separator).trim();
          const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
          return [key, value];
        }),
    ),
  );
}

function safeSlug(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

async function download(url, target) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (!response.ok) throw new Error(`download ${response.status}: ${url}`);
      await writeFile(target, Buffer.from(await response.arrayBuffer()));
      return;
    } catch (error) {
      lastError = error;
      if ((/download 4\d\d:/.test(error.message) && !/download 429:/.test(error.message)) || attempt === 3) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 750));
    }
  }
  throw lastError;
}

async function convert(source, target, geometry, quality, crop = true) {
  const args = [source, '-auto-orient', '-resize', crop ? `${geometry}^` : `${geometry}>`];
  if (crop) {
    const [width, height] = geometry.split('x');
    args.push('-gravity', 'center', '-extent', `${width}x${height}`);
  }
  args.push('-strip', '-quality', String(quality), target);
  await execFileAsync('magick', args);
}

async function objectExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10_000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function upload(supabase, objectPath, filePath, cacheControl = '31536000') {
  const body = await readFile(filePath);
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const { error } = await supabase.storage.from(BUCKET).upload(objectPath, body, {
      contentType: objectPath.endsWith('.json') ? 'application/json' : 'image/webp',
      cacheControl,
      upsert: true,
    });
    if (!error) return `${PUBLIC_BASE}/${objectPath}`;
    lastError = error;
    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 750));
  }
  throw lastError;
}

async function mapConcurrent(items, concurrency, worker) {
  let cursor = 0;
  const results = new Array(items.length);
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

const env = await readEnvFile(path.resolve('.env.local'));
if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in .env.local');
if (env.VITE_SUPABASE_URL !== PROJECT_ORIGIN) throw new Error(`Unexpected Supabase project: ${env.VITE_SUPABASE_URL}`);

const supabase = createClient(PROJECT_ORIGIN, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: rows, error: productsError } = await supabase
  .from('products_public_view')
  .select('id, slug, image_url, gallery_urls, active')
  .eq('active', true)
  .order('name');
if (productsError) throw productsError;

const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'serana-cdn-'));
const manifest = { version: 1, generatedAt: new Date().toISOString(), products: {} };

try {
  await mapConcurrent(rows, 6, async (row, index) => {
    if (!row.image_url) throw new Error(`Product without image_url: ${row.slug ?? row.id}`);
    const productKey = String(row.slug ?? row.id);
    const slug = safeSlug(productKey);
    const workdir = path.join(tempRoot, `${String(index).padStart(3, '0')}-${slug}`);
    await execFileAsync('mkdir', ['-p', workdir]);

    const variants = [
      { name: 'mobile', geometry: '480x640', quality: 72 },
      { name: 'desktop', geometry: '800x1067', quality: 76 },
      { name: 'hero', geometry: '1200x1600', quality: 78 },
    ];
    const urls = Object.fromEntries(
      variants.map((variant) => [variant.name, `${PUBLIC_BASE}/cdn/catalog/${slug}-${variant.name}.webp`]),
    );
    const variantsExist = resumeExisting && (await Promise.all(Object.values(urls).map(objectExists))).every(Boolean);
    if (!variantsExist) {
      const original = path.join(workdir, 'original');
      await download(row.image_url, original);
      for (const variant of variants) {
        const output = path.join(workdir, `${variant.name}.webp`);
        await convert(original, output, variant.geometry, variant.quality);
        urls[variant.name] = await upload(
          supabase,
          `cdn/catalog/${slug}-${variant.name}.webp`,
          output,
        );
      }
    }

    const gallerySources = Array.isArray(row.gallery_urls) ? row.gallery_urls.filter(Boolean) : [];
    const gallery = [];
    for (let galleryIndex = 0; galleryIndex < gallerySources.length; galleryIndex += 1) {
      const galleryOriginal = path.join(workdir, `gallery-${galleryIndex}-original`);
      const galleryOutput = path.join(workdir, `gallery-${galleryIndex}.webp`);
      const galleryObjectPath = `cdn/gallery/${slug}-${String(galleryIndex + 1).padStart(2, '0')}.webp`;
      const galleryUrl = `${PUBLIC_BASE}/${galleryObjectPath}`;
      try {
        if (resumeExisting && await objectExists(galleryUrl)) {
          gallery.push(galleryUrl);
          continue;
        }
        await download(gallerySources[galleryIndex], galleryOriginal);
        await convert(galleryOriginal, galleryOutput, '1200x1200', 78, false);
        gallery.push(
          await upload(
            supabase,
            galleryObjectPath,
            galleryOutput,
          ),
        );
      } catch (error) {
        console.warn(`[gallery skipped] ${slug} #${galleryIndex + 1}: ${error.message}`);
      }
    }

    manifest.products[productKey] = {
      source: row.image_url,
      mobile: urls.mobile,
      desktop: urls.desktop,
      hero: urls.hero,
      gallerySources,
      gallery,
    };
    console.log(`[${index + 1}/${rows.length}] ${slug}`);
  });

  const siteDir = path.join(tempRoot, 'site');
  await execFileAsync('mkdir', ['-p', siteDir]);
  const siteVariants = [
    { source: 'public/assets/serana-banner-bowl.png', output: 'serana-banner-mobile.webp', geometry: '480x600', quality: 74, crop: true },
    { source: 'public/assets/serana-banner-bowl.png', output: 'serana-banner-desktop.webp', geometry: '720x900', quality: 78, crop: true },
    { source: 'public/assets/serana-banner-bowl.png', output: 'serana-banner-og.webp', geometry: '1200x630', quality: 80, crop: true },
    { source: 'public/assets/serana-experience-bowl.webp', output: 'serana-experience.webp', geometry: '1400x1400', quality: 80, crop: false },
  ];
  for (const asset of siteVariants) {
    const output = path.join(siteDir, asset.output);
    await convert(asset.source, output, asset.geometry, asset.quality, asset.crop);
    await upload(supabase, `cdn/site/${asset.output}`, output);
  }

  await writeFile(
    path.resolve('public/catalog-image-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  console.log(`Published ${Object.keys(manifest.products).length} catalog entries.`);
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
