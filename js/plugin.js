// js/plugin.js
document.addEventListener('DOMContentLoaded', async () => {
    // Получаем ID из URL (после знака ?)
    const urlParams = new URLSearchParams(window.location.search);
    const pluginId = parseInt(urlParams.get('id'));

    // Если ID нет или он некорректный, возвращаем на главную
    if (!pluginId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('data/plugins.json');
        const plugins = await response.json();
        
        // Ищем нужный плагин по ID
        const plugin = plugins.find(p => p.id === pluginId);

        if (plugin) {
            // Меняем заголовок вкладки браузера
            document.title = `${plugin.name} | V0rHaM`;

            // Заполняем иконку (картинка или буква)
            const iconContainer = document.getElementById('plugin-icon');
            if (plugin.iconUrl) {
                iconContainer.innerHTML = `<img src="${plugin.iconUrl}" alt="${plugin.name}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;" />`;
            } else {
                iconContainer.textContent = plugin.name.charAt(0);
            }

            // Заполняем текстовые данные
            document.getElementById('plugin-name').textContent = plugin.name;
            document.getElementById('plugin-version').textContent = `Version ${plugin.version}`;
            document.getElementById('plugin-downloads').textContent = `${plugin.downloads} total downloads`;
            
            // Описание (если Spiget отдает короткое - используем его)
            document.getElementById('plugin-description').textContent = plugin.tagline;

            // Настраиваем кнопку скачивания
            const downloadBtn = document.getElementById('plugin-download-btn');
            downloadBtn.href = plugin.spigotUrl;
        } else {
            document.getElementById('plugin-name').textContent = "Plugin not found";
            document.getElementById('plugin-version').textContent = "Check the URL";
            document.getElementById('plugin-description').textContent = "We couldn't find a plugin with this ID in our database.";
        }
    } catch (error) {
        console.error('Failed to load plugin details:', error);
        document.getElementById('plugin-name').textContent = "Error";
        document.getElementById('plugin-description').textContent = "Failed to connect to the database. Please try again later.";
    }
});
