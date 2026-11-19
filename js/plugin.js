// js/plugin.js
document.addEventListener('DOMContentLoaded', async () => {
    // Получаем ID плагина из URL (например, authvh.html?id=105885)
    const urlParams = new URLSearchParams(window.location.search);
    const pluginId = parseInt(urlParams.get('id'));

    if (!pluginId) return;

    try {
        const response = await fetch('data/plugins.json');
        const plugins = await response.json();
        const plugin = plugins.find(p => p.id === pluginId);

        if (plugin) {
            // Заполняем данные на странице
            document.getElementById('plugin-name').textContent = plugin.name;
            document.getElementById('plugin-version').textContent = `Версия ${plugin.version}`;
            document.getElementById('plugin-downloads').textContent = `Загрузок: ${plugin.downloads}`;
            
            // Обновляем кнопку скачивания
            const downloadBtn = document.getElementById('plugin-download-btn');
            downloadBtn.href = plugin.spigotUrl;
            
            // Меняем заголовок вкладки
            document.title = `${plugin.name} | V0rHaM`;
        }
    } catch (error) {
        console.error('Failed to load plugin details:', error);
    }
});
