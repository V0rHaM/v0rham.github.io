// scripts/fetch-plugins.js
import { Spiget } from 'spiget';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const AUTHOR_ID = 147903; // ID автора V0rHaM на SpigotMC

async function fetchPluginsData() {
  const spiget = new Spiget('V0rHaM-Plugins-Page/1.0');
  const pluginsData = [];

  try {
    console.log(`Fetching resources for author ${AUTHOR_ID}...`);
    // Получаем объект автора и список его ресурсов
    const author = await spiget.getAuthor(AUTHOR_ID);
    const resources = await author.getResources();

    console.log(`Found ${resources.length} resources. Processing...`);

    for (const resource of resources) {
      try {
        // Запрашиваем последнюю версию для каждого ресурса
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
          tagline: resource.tag,
          description: resource.description || 'No description provided.',
          version: version,
          author: resource.author?.name || 'V0rHaM',
          downloads: resource.downloads || 0,
          spigotUrl: `https://www.spigotmc.org/resources/${resource.id}/`,
          iconUrl: resource.icon?.url || null,
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
