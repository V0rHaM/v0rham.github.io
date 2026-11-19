// scripts/fetch-plugins.js
import { Spiget } from 'spiget';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const AUTHOR_ID = 147903;
const USER_AGENT = 'V0rHaM-Plugins-Page/1.0';

function decodeDescription(base64) {
  if (!base64) return 'No description provided.';
  try {
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch {
    return 'No description provided.';
  }
}

async function fetchResourceDescription(id) {
  try {
    const res = await fetch(`https://api.spiget.org/v2/resources/${id}`, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (!res.ok) return 'No description provided.';
    const data = await res.json();
    return decodeDescription(data.description);
  } catch {
    return 'No description provided.';
  }
}

async function fetchPluginsData() {
  const spiget = new Spiget(USER_AGENT);
  const pluginsData = [];

  try {
    console.log(`Fetching resources for author ${AUTHOR_ID}...`);
    const author = await spiget.getAuthor(AUTHOR_ID);
    const resources = await author.getResources();

    for (const resource of resources) {
      try {
        // Описание берём напрямую через API (библиотека его не отдаёт)
        const description = await fetchResourceDescription(resource.id);

        // Версия
        let version = '1.0';
        try {
          const latestVersion = await spiget.getResourceLatestVersion(resource.id);
          version = latestVersion.name || latestVersion.id || '1.0';
        } catch (e) {
          console.log(`Could not fetch version for ${resource.id}`);
        }

        pluginsData.push({
          id: resource.id,
          name: resource.name,
          tagline: resource.tag || '',
          description: description,
          version: version,
          author: resource.author?.name || 'V0rHaM',
          downloads: resource.downloads || 0,
          spigotUrl: `https://www.spigotmc.org/resources/${resource.id}/`,
          iconUrl: resource.icon?.url
            ? (resource.icon.url.startsWith('http')
                ? resource.icon.url
                : `https://www.spigotmc.org/${resource.icon.url}`)
            : null,
        });

        console.log(`✓ ${resource.name}`);
      } catch (err) {
        console.error(`Failed to process resource ${resource.id}:`, err.message);
      }
    }

    const outputDir = join(process.cwd(), 'data');
    const outputPath = join(outputDir, 'plugins.json');
    await mkdir(outputDir, { recursive: true });
    await writeFile(outputPath, JSON.stringify(pluginsData, null, 2));
    console.log(`\nData successfully saved to ${outputPath}`);
  } catch (error) {
    console.error('Failed to fetch author data:', error.message);
  }
}

fetchPluginsData();
