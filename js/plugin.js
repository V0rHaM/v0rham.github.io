const numberFormatter = new Intl.NumberFormat('ru-RU');

function safeHttpsUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' ? url.href : '';
    } catch {
        return '';
    }
}

function sanitizeDescription(html) {
    const parser = new DOMParser();
    const documentFragment = parser.parseFromString(String(html || ''), 'text/html');

    documentFragment.querySelectorAll('script, object, embed, form').forEach(element => element.remove());
    documentFragment.querySelectorAll('*').forEach(element => {
        [...element.attributes].forEach(attribute => {
            const name = attribute.name.toLowerCase();
            const value = attribute.value.trim();
            if (name.startsWith('on') || /^(?:javascript|vbscript|data):/i.test(value)) {
                element.removeAttribute(attribute.name);
            }
        });

        if (element.tagName === 'IFRAME') {
            const source = safeHttpsUrl(element.getAttribute('src'));
            let isAllowedVideo = false;
            try {
                const host = new URL(source).hostname;
                isAllowedVideo = host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com');
            } catch {
                isAllowedVideo = false;
            }
            if (!isAllowedVideo) {
                element.remove();
                return;
            }
            element.setAttribute('loading', 'lazy');
            element.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        }

        if (element.tagName === 'A' && element.getAttribute('target') === '_blank') {
            element.setAttribute('rel', 'noopener noreferrer');
        }
    });

    return documentFragment.body.innerHTML;
}

function setPluginIcon(plugin) {
    const iconContainer = document.getElementById('plugin-icon');
    const iconUrl = safeHttpsUrl(plugin.iconUrl);
    if (!iconContainer) return;

    if (!iconUrl) {
        iconContainer.textContent = (plugin.name || 'V').trim().charAt(0).toUpperCase();
        return;
    }

    const image = document.createElement('img');
    image.src = iconUrl;
    image.alt = '';
    image.loading = 'lazy';
    image.addEventListener('error', () => {
        iconContainer.textContent = (plugin.name || 'V').trim().charAt(0).toUpperCase();
    }, { once: true });
    iconContainer.replaceChildren(image);
}

function initSpoilers(container) {
    const spoilers = container.querySelectorAll('.bbCodeSpoilerContainer');
    spoilers.forEach(spoiler => {
        const button = spoiler.querySelector('.bbCodeSpoilerButton, button.ToggleTrigger');
        if (!button) return;
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', event => {
            event.preventDefault();
            const isOpen = spoiler.classList.toggle('is-open');
            button.setAttribute('aria-expanded', String(isOpen));
        });
    });
}

async function loadPlugin() {
    const parameters = new URLSearchParams(window.location.search);
    const pluginId = Number.parseInt(parameters.get('id'), 10);
    if (!Number.isInteger(pluginId) || pluginId <= 0) {
        window.location.replace('index.html');
        return;
    }

    try {
        const response = await fetch('data/plugins.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const plugins = await response.json();
        if (!Array.isArray(plugins)) throw new Error('Unexpected plugin data format');

        const plugin = plugins.find(item => Number(item.id) === pluginId);
        if (!plugin) {
            document.getElementById('plugin-name').textContent = 'Плагин не найден';
            document.getElementById('plugin-tagline').textContent = 'Возможно, ресурс был удалён из каталога.';
            document.getElementById('plugin-description').textContent = 'Вернитесь в каталог, чтобы выбрать другой плагин.';
            document.getElementById('breadcrumbName').textContent = 'Не найден';
            return;
        }

        const name = String(plugin.name || 'Плагин без названия');
        document.title = `${name} | V0rHaM`;
        document.getElementById('plugin-name').textContent = name;
        document.getElementById('breadcrumbName').textContent = name;
        document.getElementById('plugin-tagline').textContent = plugin.tagline || 'Описание пока не добавлено.';
        document.getElementById('plugin-version').textContent = plugin.version ? `v${plugin.version}` : '—';
        document.getElementById('plugin-downloads').textContent = numberFormatter.format(Number(plugin.downloads) || 0);

        setPluginIcon(plugin);

        const description = plugin.description && plugin.description !== 'No description provided.'
            ? plugin.description
            : 'Описание пока не добавлено. Подробности доступны на странице ресурса SpigotMC.';
        const descriptionContainer = document.getElementById('plugin-description');
        descriptionContainer.innerHTML = sanitizeDescription(description);
        initSpoilers(descriptionContainer);

        const resourceUrl = safeHttpsUrl(plugin.spigotUrl);
        const resourceId = Number(plugin.id);
        const downloadButton = document.getElementById('plugin-download-btn');
        const resourceButton = document.getElementById('plugin-resource-btn');

        if (Number.isInteger(resourceId) && resourceId > 0) {
            // Spiget redirects to the currently available resource file on SpigotMC's CDN.
            downloadButton.href = `https://api.spiget.org/v2/resources/${resourceId}/download`;
        } else {
            downloadButton.removeAttribute('href');
            downloadButton.setAttribute('aria-disabled', 'true');
        }

        if (resourceUrl) {
            resourceButton.href = resourceUrl;
        } else {
            resourceButton.removeAttribute('href');
            resourceButton.setAttribute('aria-disabled', 'true');
        }
    } catch (error) {
        console.error('Не удалось загрузить страницу плагина:', error);
        document.getElementById('plugin-name').textContent = 'Не удалось загрузить плагин';
        document.getElementById('plugin-tagline').textContent = 'Попробуйте обновить страницу.';
        document.getElementById('plugin-description').textContent = 'При загрузке данных произошла ошибка.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) yearElement.textContent = new Date().getFullYear();
    loadPlugin();
});
