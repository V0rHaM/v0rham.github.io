// scripts/fetch-plugins.js
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { join } from 'node:path';

const AUTHOR_ID = 147903;
const USER_AGENT = 'V0rHaM-Plugins-Page/2.0';
const PAGE_SIZE = 100;
const MAX_PAGES = 100;

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.json();
}

function decodeDescription(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return 'No description provided.';
  }

  // Spiget returns descriptions as Base64. Keep plain HTML intact as a fallback.
  try {
    const decoded = Buffer.from(value, 'base64').toString('utf8');
    if (decoded && /[\p{L}\p{N}]/u.test(decoded)) return decoded;
  } catch {
    // Use the original value below.
  }

  return value;
}

async function fetchAllAuthorResources() {
  const resources = [];
  const seenIds = new Set();
  const PAGE_SIZE = 10;

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = new URL(
      'https://api.spigotmc.org/simple/0.2/index.php'
    );

    url.searchParams.set('action', 'getResourcesByAuthor');
    url.searchParams.set('id', String(AUTHOR_ID));
    url.searchParams.set('page', String(page));

    const batch = await fetchJson(url);

    if (!Array.isArray(batch)) {
      throw new Error(
        `Unexpected Spigot response on page ${page}: expected an array`
      );
    }

    for (const resource of batch) {
      const id = Number(resource?.id);

      if (!Number.isInteger(id) || id <= 0) continue;

      if (
        resource.author?.id &&
        Number(resource.author.id) !== AUTHOR_ID
      ) {
        continue;
      }

      if (seenIds.has(id)) continue;

      seenIds.add(id);
      resources.push(resource);
    }

    console.log(
      `Spigot page ${page}: received ${batch.length} resources`
    );

    if (batch.length < PAGE_SIZE) {
      return resources;
    }
  }

  throw new Error(
    `Stopped after ${MAX_PAGES} pages; refusing partial update`
  );
}

async function readPreviousData(outputPath) {
  try {
    const content = await readFile(outputPath, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? new Map(parsed.map(item => [Number(item.id), item])) : new Map();
  } catch {
    return new Map();
  }
}

async function fetchResourceDetails(resource, previous) {
  const id = Number(resource.id);

  let description =
    previous?.description || 'No description provided.';

  let version =
    resource.current_version ||
    resource.version?.name ||
    previous?.version ||
    '1.0';

  try {
    const details = await fetchJson(
      `https://api.spiget.org/v2/resources/${id}`
    );

    if (details?.description) {
      description = decodeDescription(details.description);
    }
  } catch (error) {
    console.warn(
      `Description unavailable for ${id}; using fallback: ${error.message}`
    );
  }

  try {
    const latest = await fetchJson(
      `https://api.spiget.org/v2/resources/${id}/versions/latest`
    );

    if (latest?.name) {
      version = String(latest.name);
    }
  } catch (error) {
    console.warn(
      `Latest version unavailable for ${id}; using fallback: ${error.message}`
    );
  }

  const iconPath =
    resource.icon_link ||
    resource.icon?.url ||
    previous?.iconUrl ||
    null;

  return {
    id,
    name:
      resource.title ||
      resource.name ||
      previous?.name ||
      `Resource ${id}`,

    tagline:
      resource.tag ||
      previous?.tagline ||
      '',

    description,
    version,

    author:
      resource.author?.username ||
      resource.author?.name ||
      previous?.author ||
      'V0rHaM',

    downloads: Number(
      resource.stats?.downloads ??
      resource.downloads ??
      previous?.downloads ??
      0
    ),

    spigotUrl:
      `https://www.spigotmc.org/resources/${id}/`,

    iconUrl: iconPath
      ? (
          String(iconPath).startsWith('http')
            ? iconPath
            : `https://www.spigotmc.org/${iconPath}`
        )
      : null,
  };
}

async function fetchPluginsData() {
  const outputDir = join(process.cwd(), 'data');
  const outputPath = join(outputDir, 'plugins.json');
  const previousData = await readPreviousData(outputPath);

  console.log(`Fetching all resources for author ${AUTHOR_ID} from Spiget...`);
  const resources = await fetchAllAuthorResources();

  if (resources.length === 0) {
    throw new Error('Spiget returned zero resources. Existing plugins.json was left untouched.');
  }

  console.log(`Found ${resources.length} resources. Loading descriptions and versions...`);

  const pluginsData = [];
  for (const resource of resources) {
    const previous = previousData.get(Number(resource.id));
    try {
      const plugin = await fetchResourceDetails(resource, previous);
      pluginsData.push(plugin);
      console.log(`✓ ${plugin.name} v${plugin.version}`);
    } catch (error) {
      console.error(`Failed to process resource ${resource.id}:`, error.message);
      if (previous) {
        pluginsData.push(previous);
        console.warn(`Retained previous data for resource ${resource.id}`);
      }
    }
  }

  if (pluginsData.length === 0) {
    throw new Error('No valid plugin records were produced. Existing plugins.json was left untouched.');
  }

  await mkdir(outputDir, { recursive: true });
  const temporaryPath = `${outputPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(pluginsData, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, outputPath);

  console.log(`Updated ${pluginsData.length} plugins in ${outputPath}`);
}

fetchPluginsData().catch(error => {
  console.error('Plugin data update failed:', error);
  process.exitCode = 1;
});
