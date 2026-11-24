const numberFormatter = new Intl.NumberFormat('ru-RU');

function safeHttpsUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' ? url.href : '';
    } catch {
        return '';
    }
}

function normalizeCodeBlock(codeContainer) {
    const normalizeNode = node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const value = node.nodeValue.replace(/\u00a0/g, ' ');
            // Spigot descriptions are pretty-printed HTML; discard formatting-only whitespace.
            if (!value.trim() && /[\r\n]/.test(value)) return null;
            return document.createTextNode(value);
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return null;
        if (node.tagName === 'BR') return document.createTextNode('\n');

        const clone = node.cloneNode(false);
        [...node.childNodes].forEach(child => {
            const normalizedChild = normalizeNode(child);
            if (normalizedChild) clone.appendChild(normalizedChild);
        });
        return clone;
    };

    const normalizedContent = document.createDocumentFragment();
    [...codeContainer.childNodes].forEach(child => {
        const normalizedChild = normalizeNode(child);
        if (normalizedChild) normalizedContent.appendChild(normalizedChild);
    });

    const wrapper = document.createElement('pre');
    wrapper.className = 'formatted-code';
    wrapper.appendChild(normalizedContent);

    // Remove only empty lines at the very beginning/end, preserving code indentation.
    const trimBoundaryNewlines = node => {
        if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = node.nodeValue.replace(/^\n+/, '').replace(/\n+$/, '');
            return;
        }
        if (!node.childNodes.length) return;
        trimBoundaryNewlines(node.firstChild);
        trimBoundaryNewlines(node.lastChild);
    };
    trimBoundaryNewlines(wrapper);

    codeContainer.replaceChildren(wrapper);
}

function injectDescriptionStyles() {
    if (document.getElementById('description-formatting-styles')) return;

    const style = document.createElement('style');
    style.id = 'description-formatting-styles';
    style.textContent = `

/* Normalized SpigotMC description markup */
.description-content .description-subheading {
    margin: 22px 0 9px;
    color: var(--text);
    font-size: 16px;
    font-weight: 780;
    line-height: 1.35;
    letter-spacing: -.025em;
}

.description-content > .description-subheading:first-child {
    margin-top: 0;
}

.description-content .BBcodeInlineCode {
    display: inline-block;
    padding: 1px 6px;
    border: 1px solid rgba(183, 213, 141, .16);
    border-radius: 4px;
    background: rgba(183, 213, 141, .07);
    color: var(--accent);
    font-family: var(--mono);
    font-size: .92em;
    line-height: 1.55;
    overflow-wrap: anywhere;
}

.description-content .bbCodeBlock,
.description-content .bbCodeCode {
    margin: 14px 0 17px;
    border: 1px solid #30372c;
    border-radius: 7px;
    background: #10130f;
}

.description-content .bbCodeBlock .type {
    padding: 8px 12px;
    background: rgba(255, 255, 255, .025);
    color: #929b89;
    font-size: 9px;
}

.description-content .bbCodeBlock .code,
.description-content .bbCodeCode .code {
    padding: 0;
    overflow: hidden;
    white-space: normal;
}

.description-content .formatted-code {
    display: block;
    max-width: 100%;
    margin: 0;
    padding: 13px 15px;
    overflow-x: auto;
    color: #c8d0bd;
    font-family: var(--mono);
    font-size: 11px;
    line-height: 1.65;
    tab-size: 4;
    white-space: pre;
    overflow-wrap: normal;
    word-break: normal;
}

.description-content .formatted-code span {
    font-family: inherit;
    font-size: inherit;
}

.description-content .bbCodeBlock .formatted-code {
    border: 0;
    border-radius: 0;
    background: transparent;
}

.description-content br + br {
    display: block;
    content: "";
    margin-top: .45em;
}

@media (max-width: 600px) {
    .description-content .description-subheading {
        margin-top: 18px;
        font-size: 15px;
    }

    .description-content .formatted-code {
        padding: 11px 12px;
        font-size: 10px;
    }
}
`;
    document.head.appendChild(style);
}

function normalizeDescriptionMarkup(container) {
    container.querySelectorAll('.bbCodeBlock .code, .bbCodeCode .code').forEach(normalizeCodeBlock);

    container.querySelectorAll('span[style*="font-size"]').forEach(heading => {
        const fontSize = heading.style.fontSize;
        if (!fontSize || !/^(18|22)px$/i.test(fontSize.trim())) return;

        const replacement = document.createElement('div');
        replacement.className = 'description-subheading';
        replacement.append(...heading.childNodes);
        heading.replaceWith(replacement);
    });
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

    normalizeDescriptionMarkup(documentFragment.body);
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
        injectDescriptionStyles();
        descriptionContainer.innerHTML = sanitizeDescription(description);
        initSpoilers(descriptionContainer);

        const resourceUrl = `https://www.spigotmc.org/resources/${Number(plugin.id)}/`;
        const resourceId = Number(plugin.id);
        const downloadButton = document.getElementById('plugin-download-btn');
        const resourceButton = document.getElementById('plugin-resource-btn');

        if (Number.isInteger(resourceId) && resourceId > 0) {
            downloadButton.href = `https://api.spiget.org/v2/resources/${resourceId}/versions/latest/download/proxy`;
            downloadButton.setAttribute('download', '');
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
