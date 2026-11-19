// js/main.js
async function renderPlugins() {
    const grid = document.getElementById('pluginGrid');
    try {
        const response = await fetch('data/plugins.json');
        const plugins = await response.json();

        grid.innerHTML = plugins.map(p => {
            const iconHtml = p.iconUrl
                ? `<img src="${p.iconUrl}" alt="${p.name}" />`
                : `<span class="card-icon-letter">${p.name.charAt(0)}</span>`;

            return `
            <article class="card">
                <div class="card-top">
                    <div class="card-icon">${iconHtml}</div>
                    <div class="card-head">
                        <span class="card-tag">Plugin</span>
                        <h2>${p.name}</h2>
                    </div>
                </div>
                <p class="desc">${p.tagline || ''}</p>
                <div class="card-divider"></div>
                <div class="card-footer">
                    <div class="card-meta">
                        <span class="tag">v${p.version}</span>
                        <span class="downloads">${Number(p.downloads).toLocaleString()} downloads</span>
                    </div>
                    <div class="card-buttons">
                        <a href="plugin.html?id=${p.id}" class="btn btn-secondary">Details</a>
                        <a href="${p.spigotUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Download</a>
                    </div>
                </div>
            </article>`;
        }).join('');
    } catch (error) {
        console.error('Failed to load plugin data:', error);
        grid.innerHTML = '<p class="empty-state">Failed to load plugin data.</p>';
    }
}

document.addEventListener('DOMContentLoaded', renderPlugins);
