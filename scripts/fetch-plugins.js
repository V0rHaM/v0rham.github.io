// scripts/fetch-plugins.js
import { Spiget } from 'spiget';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const RESOURCE_IDS = [105885, 112792, 112089];

async function fetchPluginsData() {
  const spiget = new Spiget('V0rHaM-Plugins-Page/1.0');
  const pluginsData = [];

  for (const id of RESOURCE_IDS) {
    try {
      console.log(`Fetching resource ${id}...`);
      const resource = await spiget.getResource(id);
      
      // Отдельный запрос за последней версией
      let version = '1.0';
      try {
        const latestVersion = await spiget.getResourceLatestVersion(id);
        version = latestVersion.name || latestVersion.id;
      } catch (e) {
        console.log(`Could not fetch version for ${id}`);
      }

      pluginsData.push({
        id: resource.id,
        name: resource.name,
        tagline: resource.tag,
        version: version,
        author: resource.author?.name || 'V0rHaM',
        downloads: resource.downloads || 0,
        spigotUrl: `https://www.spigotmc.org/resources/${id}/`,
        // Если иконки нет, оставляем null
        iconUrl: resource.icon?.url || null, 
      });
    } catch (error) {
      console.error(`Failed to fetch resource ${id}:`, error.message);
    }
  }

  const outputDir = join(process.cwd(), 'data');
  const outputPath = join(outputDir, 'plugins.json');
  try {
    await mkdir(outputDir, { recursive: true });
    await writeFile(outputPath, JSON.stringify(pluginsData, null, 2));
    console.log(`Data saved to ${outputPath}`);
  } catch (error) {
    console.error('Failed to write data file:', error.message);
  }
}

fetchPluginsData();
