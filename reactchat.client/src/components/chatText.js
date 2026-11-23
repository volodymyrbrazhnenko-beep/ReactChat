import { createElement } from 'react';

function decodeEntities(value) {
    const parsedDocument = new DOMParser().parseFromString(value, 'text/html');
    return parsedDocument.body.textContent;
}

function isSafeHref(value) {
    const href = decodeEntities(value);
    const hasControlCharacters = [...href].some(character => {
        const code = character.charCodeAt(0);
        return code <= 31 || (code >= 127 && code <= 159);
    });
    if (!href || hasControlCharacters || href.includes('\\')) {
        return false;
    }

    try {
        const protocol = new URL(href, window.location.href).protocol;
        return ['http:', 'https:', 'mailto:'].includes(protocol);
    } catch {
        return false;
    }
}

function getTag(token) {
    if (token === '<br />') {
        return { name: 'br', selfClosing: true };
    }

    if (token === '<code>' || token === '</code>' || token === '<i>' || token === '</i>' || token === '<strong>' || token === '</strong>') {
        return { name: token.slice(token.startsWith('</') ? 2 : 1, -1), closing: token.startsWith('</') };
    }

    if (token === '</a>') {
        return { name: 'a', closing: true };
    }

    const link = /^<a href="([^"<>]*)" title="([^"<>]*)">$/.exec(token);
    if (link && isSafeHref(link[1])) {
        return { name: 'a', href: decodeEntities(link[1]), title: decodeEntities(link[2]), closing: false };
    }

    return undefined;
}

export function isValidChatText(value) {
    const stack = [];
    let position = 0;

    while (position < value.length) {
        const opening = value.indexOf('<', position);
        if (opening === -1) {
            break;
        }

        const closing = value.indexOf('>', opening + 1);
        if (closing === -1) {
            return false;
        }

        const tag = getTag(value.slice(opening, closing + 1));
        if (!tag) {
            return false;
        }

        if (tag.selfClosing) {
            position = closing + 1;
            continue;
        }

        if (tag.closing) {
            if (stack.pop() !== tag.name) {
                return false;
            }
        } else {
            if (tag.name === 'a' && stack.includes('a')) {
                return false;
            }
            stack.push(tag.name);
        }
        position = closing + 1;
    }

    return stack.length === 0;
}

export function renderChatText(value) {
    if (!isValidChatText(value)) {
        return value;
    }

    const root = { children: [] };
    const stack = [root];
    const parts = value.split(/(<[^>]*>)/g);
    let key = 0;

    for (const part of parts) {
        if (!part) {
            continue;
        }

        if (!part.startsWith('<')) {
            stack[stack.length - 1].children.push(decodeEntities(part));
            continue;
        }

        const tag = getTag(part);
        if (tag.selfClosing) {
            stack[stack.length - 1].children.push(createElement(tag.name, { key: key++ }));
            continue;
        }

        if (tag.closing) {
            const element = stack.pop();
            stack[stack.length - 1].children.push(createElement(element.name, { ...element.props, key: key++ }, ...element.children));
        } else {
            const props = tag.name === 'a' ? { href: tag.href, title: tag.title } : {};
            stack.push({ name: tag.name, props, children: [] });
        }
    }

    return root.children;
}
