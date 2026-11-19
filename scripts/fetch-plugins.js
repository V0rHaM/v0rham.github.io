// scripts/fetch-plugins.js
import { Spiget } from 'spiget';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESOURCE_IDS = [105885, 112792, 112089]; // AuthVH, HiddenNamesVH, SpyCommand

async function fetchPluginsData() {
  // Инициализация клиента Spiget с идентификатором приложения
  const spiget = new Spiget('V0rHaM-Plugins-Page/1.0');
  const pluginsData = [];

  for (const id of RESOURCE_IDS) {
    try {
      console.log(`Fetching resource ${id}...`);
      // Получаем информацию о ресурсе через Spiget API
      const resource = await spiget.getResource(id);

      // Формируем объект с нужными полями для сайта
      pluginsData.push({
        id: resource.id,
        name: resource.name,
        tagline: resource.tag,
        version: resource.version?.id || 'N/A',
        description: resource.tag, // Spiget обычно возвращает краткое описание в tag
        author: resource.author?.name || 'V0rHaM',
        downloads: resource.downloads || 0,
        lastUpdate: resource.updateDate,
        spigotUrl: `https://www.spigotmc.org/resources/${id}/`,
        iconUrl: resource.icon?.url || '', // Ссылка на иконку, если есть
      });
    } catch (error) {
      console.error(`Failed to fetch resource ${id}:`, error.message);
    }
  }

  // Создаём директорию data, если её нет, и записываем файл
  const outputDir = join(process.cwd(), 'data');
  const outputPath = join(outputDir, 'plugins.json');
  try {
    await mkdir(outputDir, { recursive: true });
    await writeFile(outputPath, JSON.stringify(pluginsData, null, 2));
    console.log(`Data saved to ${outputPath}`);
  } catch (error) {
    console.error('Failed to write data file:', error.message);
    process.exit(1); // Завершаем с ошибкой, чтобы Workflow упал
  }
}

fetchPluginsData();
