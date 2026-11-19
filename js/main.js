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
                <div class="card-body">
                    <div class="card-icon">${iconHtml}</div>
                    <div class="card-content">
                        <span class="card-tag">Plugin</span>
                        <h2 class="card-title">${p.name}</h2>
                        <p class="card-desc">${p.tagline || ''}</p>
                    </div>
                </div>
                <div class="card-divider"></div>
                <div class="card-actions">
                    <a href="${p.spigotUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-download">
                        Download
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
                    </a>
                    <a href="plugin.html?id=${p.id}" class="card-link">Details</a>
                    <span class="card-version">v${p.version}</span>
                </div>
            </article>`;
        }).join('');
    } catch (error) {
        console.error('Failed to load plugin data:', error);
        grid.innerHTML = '<p class="empty-state">Failed to load plugin data.</p>';
    }
}

document.addEventListener('DOMContentLoaded', renderPlugins);
