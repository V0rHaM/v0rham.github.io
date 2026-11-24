
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
            if (!value.trim() && /[\r\n]/.test(value)) return null;
            return document.createTextNode(value);
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return null;
        if (node.tagName === 'BR') return document.createTextNode('\n');

        const clone = node.cloneNode(false);

        [...node.childNodes].forEach(child => {
            const normalized = normalizeNode(child);
            if (normalized) clone.appendChild(normalized);
        });

        return clone;
    };

    const fragment = document.createDocumentFragment();

    [...codeContainer.childNodes].forEach(child => {
        const normalized = normalizeNode(child);
        if (normalized) fragment.appendChild(normalized);
    });

    const pre = document.createElement('pre');
    pre.className = 'formatted-code';
    pre.appendChild(fragment);

    const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) textNodes.push(walker.currentNode);

    if (textNodes.length) {
        textNodes[0].nodeValue =
            textNodes[0].nodeValue.replace(/^\n+/, '');

        const last = textNodes[textNodes.length - 1];
        last.nodeValue = last.nodeValue.replace(/\n+$/, '');
    }

    codeContainer.replaceChildren(pre);
}

function injectDescriptionStyles() {
    if (document.getElementById('description-formatting-styles')) return;

    const style = document.createElement('style');
    style.id = 'description-formatting-styles';

    style.textContent = `
.description-content {
    color: #c8cebf;
    font-size: 14px;
    line-height: 1.75;
    overflow-wrap: anywhere;
}

.description-content > :first-child { margin-top: 0; }
.description-content > :last-child { margin-bottom: 0; }
.description-content p { margin: 0 0 13px; }

.description-content h1,
.description-content h2,
.description-content h3,
.description-content h4,
.description-content .description-subheading {
    margin: 28px 0 11px;
    color: var(--text);
    font-weight: 800;
    line-height: 1.35;
    letter-spacing: -.025em;
}

.description-content h1 { font-size: 22px; }
.description-content h2 { font-size: 19px; }

.description-content h3,
.description-content h4,
.description-content .description-subheading {
    font-size: 16px;
}

.description-content ul,
.description-content ol {
    margin: 10px 0 20px;
    padding-left: 25px;
}

.description-content li {
    margin: 5px 0;
    padding-left: 3px;
}

.description-content li::marker { color: var(--accent); }

.description-content strong,
.description-content b {
    color: #edf0e6;
    font-weight: 750;
}

.description-content a {
    color: var(--accent);
    text-decoration: underline;
    text-decoration-color: rgba(183,213,141,.35);
    text-underline-offset: 3px;
}

.description-content .BBcodeInlineCode {
    display: inline-block;
    padding: 1px 6px;
    border: 1px solid rgba(183,213,141,.18);
    border-radius: 4px;
    background: rgba(183,213,141,.07);
    color: var(--accent);
    font-family: var(--mono);
    font-size: .9em;
    line-height: 1.55;
    overflow-wrap: anywhere;
}

.description-content .bbCodeBlock,
.description-content .bbCodeCode {
    margin: 17px 0 23px;
    overflow: hidden;
    border: 1px solid #30372c;
    border-radius: 8px;
    background: #10130f;
}

.description-content .bbCodeBlock .type {
    padding: 8px 13px;
    border-bottom: 1px solid #292f26;
    background: rgba(255,255,255,.025);
    color: #929b89;
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: .04em;
}

.description-content .bbCodeBlock .code,
.description-content .bbCodeCode .code {
    padding: 0;
    overflow: visible;
    white-space: normal;
}

.description-content .formatted-code {
    display: block;
    max-width: 100%;
    margin: 0;
    padding: 14px 16px;
    overflow-x: auto;
    color: #cbd3c2;
    font-family: var(--mono);
    font-size: 11px;
    line-height: 1.6;
    tab-size: 4;
    white-space: pre;
    overflow-wrap: normal;
    word-break: normal;
}

.description-content .formatted-code span {
    font-family: inherit;
    font-size: inherit;
}

.description-content img {
    max-width: 100%;
    height: auto;
    border-radius: 7px;
}

.description-content table {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
}

.description-content td,
.description-content th {
    padding: 7px 10px;
    border: 1px solid var(--border);
}

.description-content hr {
    margin: 24px 0;
    border: 0;
    border-top: 1px solid var(--border);
}

.description-content .bbCodeSpoilerContainer {
    margin: 16px 0;
    border: 1px solid var(--border);
    border-radius: 7px;
    overflow: hidden;
}

.description-content .bbCodeSpoilerButton {
    width: 100%;
    padding: 11px 14px;
    background: rgba(255,255,255,.03);
    color: var(--text);
    text-align: left;
    cursor: pointer;
}

.description-content .SpoilerTarget,
.description-content .bbCodeSpoilerText {
    display: none;
    padding: 14px;
    border-top: 1px solid var(--border);
}

.description-content .bbCodeSpoilerContainer.is-open > .SpoilerTarget,
.description-content .bbCodeSpoilerContainer.is-open > .bbCodeSpoilerText {
    display: block;
}

@media (max-width: 650px) {
    .description-content {
        font-size: 13px;
        line-height: 1.7;
    }

    .description-content h1 { font-size: 20px; }
    .description-content h2 { font-size: 18px; }

    .description-content h3,
    .description-content h4,
    .description-content .description-subheading {
        font-size: 15px;
    }

    .description-content .formatted-code {
        padding: 11px;
        font-size: 10px;
    }
}
`;

    document.head.appendChild(style);
}

function normalizeDescriptionMarkup(container) {
    container.querySelectorAll(
        '.bbCodeBlock .code, .bbCodeCode .code'
    ).forEach(normalizeCodeBlock);

    container.querySelectorAll('span[style*="font-size"]').forEach(element => {
        const size = element.style.fontSize.trim();

        if (!/^(18|22)px$/i.test(size)) return;

        const heading = document.createElement(
            size === '22px' ? 'h2' : 'h3'
        );

        heading.className = 'description-subheading';
        heading.append(...element.childNodes);
        element.replaceWith(heading);
    });
}

function sanitizeDescription(html) {
    const parsed = new DOMParser().parseFromString(
        String(html || ''),
        'text/html'
    );

    parsed.querySelectorAll(
        'script, object, embed, form, base, meta, link'
    ).forEach(element => element.remove());

    parsed.querySelectorAll('*').forEach(element => {
        [...element.attributes].forEach(attribute => {
            const name = attribute.name.toLowerCase();
            const value = attribute.value.trim();

            if (
                name.startsWith('on') ||
                /^(?:javascript|vbscript|data):/i.test(value)
            ) {
                element.removeAttribute(attribute.name);
            }
        });

        if (element.tagName === 'IFRAME') {
            const source = safeHttpsUrl(element.getAttribute('src'));
            let allowed = false;

            try {
                const host = new URL(source).hostname;

                allowed =
                    host === 'youtube.com' ||
                    host.endsWith('.youtube.com') ||
                    host === 'youtube-nocookie.com' ||
                    host.endsWith('.youtube-nocookie.com');
            } catch {}

            if (!allowed) {
                element.remove();
            } else {
                element.setAttribute('loading', 'lazy');
                element.setAttribute(
                    'referrerpolicy',
                    'strict-origin-when-cross-origin'
                );
            }
        }

        if (element.tagName === 'A') {
            const href = element.getAttribute('href');

            if (
                href &&
                !/^(https?:|mailto:|#)/i.test(href.trim())
            ) {
                element.removeAttribute('href');
            }

            if (element.getAttribute('target') === '_blank') {
                element.setAttribute('rel', 'noopener noreferrer');
            }
        }
    });

    normalizeDescriptionMarkup(parsed.body);

    return parsed.body.innerHTML;
}

function setPluginIcon(plugin) {
    const iconContainer = document.getElementById('plugin-icon');
    const iconUrl = safeHttpsUrl(plugin.iconUrl);

    if (!iconContainer) return;

    if (!iconUrl) {
        iconContainer.textContent =
            (plugin.name || 'V').trim().charAt(0).toUpperCase();
        return;
    }

    const image = document.createElement('img');
    image.src = iconUrl;
    image.alt = '';
    image.loading = 'lazy';

    image.addEventListener('error', () => {
        iconContainer.textContent =
            (plugin.name || 'V').trim().charAt(0).toUpperCase();
    }, { once: true });

    iconContainer.replaceChildren(image);
}

function initSpoilers(container) {
    container.querySelectorAll('.bbCodeSpoilerContainer').forEach(spoiler => {
        const button = spoiler.querySelector(
            '.bbCodeSpoilerButton, button.ToggleTrigger'
        );

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
        const response = await fetch(
            'data/plugins.json',
            { cache: 'no-store' }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const plugins = await response.json();

        if (!Array.isArray(plugins)) {
            throw new Error('Unexpected plugin data format');
        }

        const plugin = plugins.find(
            item => Number(item.id) === pluginId
        );

        if (!plugin) {
            document.getElementById('plugin-name').textContent =
                'Плагин не найден';

            document.getElementById('plugin-tagline').textContent =
                'Возможно, ресурс был удалён из каталога.';

            document.getElementById('plugin-description').textContent =
                'Вернитесь в каталог, чтобы выбрать другой плагин.';

            document.getElementById('breadcrumbName').textContent =
                'Не найден';

            return;
        }

        const name = String(plugin.name || 'Плагин без названия');

        document.title = `${name} | V0rHaM`;

        document.getElementById('plugin-name').textContent = name;
        document.getElementById('breadcrumbName').textContent = name;

        document.getElementById('plugin-tagline').textContent =
            plugin.tagline || 'Описание пока не добавлено.';

        document.getElementById('plugin-version').textContent =
            plugin.version ? `v${plugin.version}` : '—';

        document.getElementById('plugin-downloads').textContent =
            numberFormatter.format(Number(plugin.downloads) || 0);

        setPluginIcon(plugin);

        const description =
            plugin.description &&
            plugin.description !== 'No description provided.'
                ? plugin.description
                : 'Описание пока не добавлено. Подробности доступны на странице ресурса SpigotMC.';

        const descriptionContainer =
            document.getElementById('plugin-description');

        injectDescriptionStyles();

        descriptionContainer.innerHTML =
            sanitizeDescription(description);

        initSpoilers(descriptionContainer);

        const resourceId = Number(plugin.id);

        const downloadButton =
            document.getElementById('plugin-download-btn');

        const resourceButton =
            document.getElementById('plugin-resource-btn');

        if (Number.isInteger(resourceId) && resourceId > 0) {
            downloadButton.href =
                `https://api.spiget.org/v2/resources/${resourceId}/versions/latest/download/proxy`;

            downloadButton.setAttribute('download', '');

            resourceButton.href =
                `https://www.spigotmc.org/resources/${resourceId}/`;
        } else {
            downloadButton.removeAttribute('href');
            downloadButton.setAttribute('aria-disabled', 'true');

            resourceButton.removeAttribute('href');
            resourceButton.setAttribute('aria-disabled', 'true');
        }

    } catch (error) {
        console.error(
            'Не удалось загрузить страницу плагина:',
            error
        );

        document.getElementById('plugin-name').textContent =
            'Не удалось загрузить плагин';

        document.getElementById('plugin-tagline').textContent =
            'Попробуйте обновить страницу.';

        document.getElementById('plugin-description').textContent =
            'При загрузке данных произошла ошибка.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('currentYear');

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    loadPlugin();
});
