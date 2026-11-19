const plugins = [
    {
        id: 'authvh',
        name: 'AuthVH',
        desc: 'Простой плагин авторизации: регистрация, вход, управление сессиями и账户.',
        version: '1.9.141',
        tag: 'Авторизация',
        spigotUrl: 'https://www.spigotmc.org/resources/authvh.105885/',
        pageUrl: 'authvh.html'
    },
    {
        id: 'hiddennamesvh',
        name: 'HiddenNamesVH',
        desc: 'Скрывает ники игроков над головой. Лёгкий и ненавязчивый.',
        version: '1.0',
        tag: 'Чат',
        spigotUrl: 'https://www.spigotmc.org/resources/hiddennamesvh.112792/',
        pageUrl: 'hiddennamesvh.html'
    },
    {
        id: 'spycommand',
        name: 'SpyCommand',
        desc: 'Мониторинг команд игроков в реальном времени для администрации.',
        version: '1.0',
        tag: 'Модерация',
        spigotUrl: 'https://www.spigotmc.org/resources/spycommand.112089/',
        pageUrl: 'spycommand.html'
    }
];

function renderPlugins() {
    const grid = document.getElementById('pluginGrid');
    grid.innerHTML = plugins.map(p => `
        <article class="card">
            <div class="card-icon">${p.name.charAt(0)}</div>
            <h2>${p.name}</h2>
            <p class="desc">${p.desc}</p>
            <div class="card-meta">
                <span class="tag">${p.tag}</span>
                <span>v${p.version}</span>
            </div>
            <div class="card-buttons">
                <a href="${p.pageUrl}" class="btn btn-secondary">Подробнее</a>
                <a href="${p.spigotUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                    <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Скачать
                </a>
            </div>
        </article>
    `).join('');
}

document.addEventListener('DOMContentLoaded', renderPlugins);
