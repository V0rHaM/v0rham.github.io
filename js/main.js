const numberFormatter = new Intl.NumberFormat('ru-RU');

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

function safeHttpsUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' ? url.href : '';
    } catch {
        return '';
    }
}

function formatNumber(value) {
    const numericValue = Number(value);
    return numberFormatter.format(Number.isFinite(numericValue) ? numericValue : 0);
}

function createPluginCard(plugin) {
    const name = escapeHtml(plugin.name || 'Без названия');
    const tagline = escapeHtml(plugin.tagline || 'Описание пока не добавлено.');
    const version = escapeHtml(plugin.version || '—');
    const id = Number(plugin.id);
    const detailsUrl = Number.isInteger(id) && id > 0 ? `plugin.html?id=${id}` : 'plugin.html';
    const downloadUrl = safeHttpsUrl(plugin.spigotUrl);
    const iconUrl = safeHttpsUrl(plugin.iconUrl);
    const icon = iconUrl
        ? `<img src="${escapeHtml(iconUrl)}" alt="" loading="lazy" decoding="async">`
        : `<span>${escapeHtml((plugin.name || 'V').trim().charAt(0).toUpperCase())}</span>`;
    const downloadAction = downloadUrl
        ? `<a class="card-link card-link-primary" href="${escapeHtml(downloadUrl)}" target="_blank" rel="noopener noreferrer">SpigotMC ↗</a>`
        : '';

    return `
        <article class="plugin-card">
            <div class="card-top">
                <div class="card-icon">${icon}</div>
                <div class="card-main">
                    <p class="card-kicker">Minecraft plugin</p>
                    <h3 class="card-title">${name}</h3>
                    <p class="card-description">${tagline}</p>
                </div>
            </div>
            <div class="card-bottom">
                <div class="card-meta">
                    <span class="card-version">v${version}</span>
                    <span>${formatNumber(plugin.downloads)} загрузок</span>
                </div>
                <div class="card-actions">
                    <a class="card-link" href="${detailsUrl}">Подробнее →</a>
                    ${downloadAction}
                </div>
            </div>
        </article>`;
}

async function renderPlugins() {
    const grid = document.getElementById('pluginGrid');
    if (!grid) return;

    try {
        const response = await fetch('data/plugins.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const plugins = await response.json();
        if (!Array.isArray(plugins)) throw new Error('Unexpected plugin data format');

        const sortedPlugins = [...plugins].sort((first, second) => Number(second.downloads || 0) - Number(first.downloads || 0));
        const totalDownloads = sortedPlugins.reduce((total, plugin) => total + (Number(plugin.downloads) || 0), 0);

        document.getElementById('pluginCount').textContent = formatNumber(sortedPlugins.length);
        document.getElementById('downloadCount').textContent = formatNumber(totalDownloads);
        document.getElementById('catalogCount').textContent = `${String(sortedPlugins.length).padStart(2, '0')} РЕСУРСОВ`;
        grid.innerHTML = sortedPlugins.length
            ? sortedPlugins.map(createPluginCard).join('')
            : '<p class="empty-state">В каталоге пока нет опубликованных плагинов.</p>';
    } catch (error) {
        console.error('Не удалось загрузить каталог плагинов:', error);
        grid.innerHTML = '<p class="empty-state">Не удалось загрузить каталог. Попробуйте обновить страницу.</p>';
        document.getElementById('catalogCount').textContent = 'НЕТ ДАННЫХ';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) yearElement.textContent = new Date().getFullYear();
    renderPlugins();
});
