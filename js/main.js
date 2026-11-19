async function renderPlugins() {
    const grid = document.getElementById('pluginGrid');
    try {
        // Загружаем данные из нашего JSON-файла, а не из внешнего API
        const response = await fetch('data/plugins.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const plugins = await response.json();

        grid.innerHTML = plugins.map(p => `
            <article class="card">
                <img src="${p.iconUrl}" alt="${p.name}" class="card-icon-img" />
                <h2>${p.name}</h2>
                <p class="desc">${p.tagline}</p>
                <div class="card-meta">
                    <span>v${p.version}</span>
                    <span>${p.downloads} загрузок</span>
                </div>
                <div class="card-buttons">
                    <a href="${p.id}.html" class="btn btn-secondary">Подробнее</a>
                    <a href="${p.spigotUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Скачать</a>
                </div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Failed to load plugin data:', error);
        grid.innerHTML = '<p class="empty-state">Не удалось загрузить данные о плагинах. Попробуйте позже.</p>';
    }
}

document.addEventListener('DOMContentLoaded', renderPlugins);
