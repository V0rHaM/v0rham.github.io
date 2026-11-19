// scripts/fetch-plugins.js
import { SpigotClient } from 'spigot-sdk';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// ID ваших ресурсов на SpigotMC (можно найти в URL)
const RESOURCE_IDS = [105885, 112792, 112089]; // AuthVH, HiddenNamesVH, SpyCommand

async function fetchPluginsData() {
  const client = new SpigotClient();
  const pluginsData = [];

  for (const id of RESOURCE_IDS) {
    try {
      console.log(`Fetching resource ${id}...`);
      const resource = await client.getResource(id);

      // Формируем объект с нужными полями для нашего сайта
      pluginsData.push({
        id: resource.id,
        name: resource.title,
        tagline: resource.tag,
        version: resource.current_version,
        // Преобразуем описание из BBCode в простой текст (базово)
        description: resource.description.replace(/\[.*?\]/g, ''),
        author: resource.author.username,
        downloads: resource.stats.downloads,
        lastUpdate: resource.last_update,
        spigotUrl: `https://www.spigotmc.org/resources/${id}/`,
        iconUrl: resource.icon_link,
      });
    } catch (error) {
      console.error(`Failed to fetch resource ${id}:`, error.message);
    }
  }

  // Сохраняем результат в JSON-файл, который будет читать наш сайт
  const outputPath = join(process.cwd(), 'data', 'plugins.json');
  await writeFile(outputPath, JSON.stringify(pluginsData, null, 2));
  console.log(`Data saved to ${outputPath}`);
}

fetchPluginsData();
