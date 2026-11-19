// js/main.js

async function renderPlugins() {
    const grid = document.getElementById('pluginGrid');
    try {
        const response = await fetch('data/plugins.json');
        const plugins = await response.json();

        grid.innerHTML = plugins.map(p => {
            // Если есть иконка - картинка, иначе - первая буква названия
            const iconHtml = p.iconUrl 
                ? `<img src="${p.iconUrl}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" />`
                : `${p.name.charAt(0)}`;

            return `
            <article class="card">
                <div class="card-icon">${iconHtml}</div>
                <h2>${p.name}</h2>
                <p class="desc">${p.tagline}</p>
                <div class="card-meta">
                    <span class="tag">v${p.version}</span>
                    <span>${p.downloads} downloads</span>
                </div>
                <div class="card-buttons">
                    <!-- Кнопка теперь ведет на универсальную страницу с ID -->
                    <a href="plugin.html?id=${p.id}" class="btn btn-secondary">Details</a>
                    <a href="${p.spigotUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Download</a>
                </div>
            </article>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load plugin data:', error);
        grid.innerHTML = '<p class="empty-state">Failed to load plugin data.</p>';
    }
}

document.addEventListener('DOMContentLoaded', renderPlugins);
