// js/plugin.js
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pluginId = parseInt(urlParams.get('id'));

    if (!pluginId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('data/plugins.json');
        const plugins = await response.json();
        const plugin = plugins.find(p => p.id === pluginId);

        if (plugin) {
            document.title = `${plugin.name} | V0rHaM`;
            document.getElementById('plugin-name').textContent = plugin.name;
            document.getElementById('plugin-version').textContent = `Version ${plugin.version}`;
            document.getElementById('plugin-downloads').textContent = `${plugin.downloads} total downloads`;

            // Иконка
            const iconContainer = document.getElementById('plugin-icon');
            if (plugin.iconUrl) {
                iconContainer.innerHTML = `<img src="${plugin.iconUrl}" alt="${plugin.name}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;" />`;
            } else {
                iconContainer.textContent = plugin.name.charAt(0);
            }

            // Описание
            const descContainer = document.getElementById('plugin-description');
            if (plugin.description && plugin.description.trim() !== '' && plugin.description !== 'No description provided.') {
                // Убираем скрипты
                let cleanHtml = plugin.description.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                descContainer.innerHTML = cleanHtml;

                // Делаем спойлеры рабочими
                initSpoilers(descContainer);
            } else {
                descContainer.textContent = 'No description provided.';
            }

            const downloadBtn = document.getElementById('plugin-download-btn');
            downloadBtn.href = plugin.spigotUrl;
        } else {
            document.getElementById('plugin-name').textContent = "Plugin not found";
        }
    } catch (error) {
        console.error('Failed to load plugin details:', error);
        document.getElementById('plugin-name').textContent = "Error";
    }
});

function initSpoilers(container) {
    const spoilers = container.querySelectorAll('.bbCodeSpoilerContainer, .ToggleTriggerAnchor.bbCodeSpoilerContainer');

    spoilers.forEach(spoiler => {
        const button = spoiler.querySelector('.bbCodeSpoilerButton, button.ToggleTrigger');
        if (!button) return;

        // Убираем старые обработчики и делаем свой
        button.addEventListener('click', (e) => {
            e.preventDefault();
            spoiler.classList.toggle('is-open');
        });
    });
}
