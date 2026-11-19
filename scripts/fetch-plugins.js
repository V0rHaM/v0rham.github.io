// scripts/fetch-plugins.js
import { Spiget } from 'spiget';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const AUTHOR_ID = 147903;

async function fetchPluginsData() {
  const spiget = new Spiget('V0rHaM-Plugins-Page/1.0');
  const pluginsData = [];

  try {
    console.log(`Fetching resources for author ${AUTHOR_ID}...`);
    const author = await spiget.getAuthor(AUTHOR_ID);
    const resources = await author.getResources();

    for (const resource of resources) {
      try {
        // 1. Получаем полное описание
        let description = 'No description provided.';
        try {
          description = await spiget.getResourceDescription(resource.id);
        } catch (e) {
          console.log(`Could not fetch description for ${resource.id}`);
        }

        // 2. Получаем актуальную версию
        let version = '1.0';
        try {
          const latestVersion = await spiget.getResourceLatestVersion(resource.id);
          version = latestVersion.name || latestVersion.id || '1.0';
          
          // Если версия всё равно 1.0, пробуем получить список версий и берем первую
          if (version === '1.0') {
             const versions = await spiget.getResourceVersions(resource.id);
             if (versions && versions.length > 0) {
                 version = versions[0].name || '1.0';
             }
          }
        } catch (e) {
          console.log(`Could not fetch version for ${resource.id}`);
        }

        pluginsData.push({
          id: resource.id,
          name: resource.name,
          tagline: resource.tag,
          description: description,
          version: version,
          author: resource.author?.name || 'V0rHaM',
          downloads: resource.downloads || 0,
          spigotUrl: `https://www.spigotmc.org/resources/${resource.id}/`,
          // Если ссылка на иконку относительная, добавляем домен SpigotMC
          iconUrl: resource.icon?.url ? (resource.icon.url.startsWith('http') ? resource.icon.url : `https://www.spigotmc.org/${resource.icon.url}`) : null,
        });
      } catch (err) {
        console.error(`Failed to process resource ${resource.id}:`, err.message);
      }
    }

    const outputDir = join(process.cwd(), 'data');
    const outputPath = join(outputDir, 'plugins.json');
    await mkdir(outputDir, { recursive: true });
    await writeFile(outputPath, JSON.stringify(pluginsData, null, 2));
    console.log(`Data successfully saved to ${outputPath}`);

  } catch (error) {
    console.error('Failed to fetch author data:', error.message);
  }
}

fetchPluginsData();
