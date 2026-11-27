import { useLayoutEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faBold, faCode, faItalic, faLink } from '@fortawesome/free-solid-svg-icons';
import { isValidChatText } from './chatText';

function ChatTextEditor({ id, name, rows, required = false, value: controlledValue, onChange }) {
    const [internalValue, setInternalValue] = useState('');
    const value = controlledValue === undefined ? internalValue : controlledValue;
    const selectionRef = useRef();
    const textareaRef = useRef(null);

    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) {
            return;
        }

        textarea.setCustomValidity(isValidChatText(value) ? '' : 'Use only links, code, italic, bold, and line-break tags with matching opening and closing tags.');
        const selection = selectionRef.current;
        if (selection) {
            selectionRef.current = undefined;
            textarea.focus();
            textarea.setSelectionRange(selection.start, selection.end);
        }
    }, [value]);

    function insertTag(tagName) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        if (tagName === 'br') {
            const nextValue = `${value.slice(0, start)}<br />${value.slice(end)}`;
            const cursorPosition = start + '<br />'.length;
            selectionRef.current = { start: cursorPosition, end: cursorPosition };
            if (controlledValue === undefined) {
                setInternalValue(nextValue);
            }
            if (onChange) {
                onChange(nextValue);
            }
            return;
        }

        const selectedText = value.slice(start, end) || (tagName === 'a' ? 'link text' : 'text');
        const openingTag = tagName === 'a'
            ? '<a href="https://example.com" title="Link title">'
            : `<${tagName}>`;
        const closingTag = `</${tagName}>`;
        const insertedText = `${openingTag}${selectedText}${closingTag}`;
        const nextValue = `${value.slice(0, start)}${insertedText}${value.slice(end)}`;
        const contentStart = start + openingTag.length;

        selectionRef.current = { start: contentStart, end: contentStart + selectedText.length };
        if (controlledValue === undefined) {
            setInternalValue(nextValue);
        }
        if (onChange) {
            onChange(nextValue);
        }
    }

    function handleChange(event) {
        const nextValue = event.currentTarget.value;
        event.currentTarget.setCustomValidity(isValidChatText(nextValue) ? '' : 'Use only links, code, italic, bold, and line-break tags with matching opening and closing tags.');
        if (controlledValue === undefined) {
            setInternalValue(nextValue);
        }
        if (onChange) {
            onChange(nextValue);
        }
    }

    const isInvalid = !isValidChatText(value);

    return (
        <>
            <div className="d-flex gap-2 mb-2" role="toolbar" aria-label="Text formatting">
                <button type="button" className="btn btn-outline-secondary" title="Insert link" aria-label="Insert link" onClick={() => insertTag('a')}>
                    <FontAwesomeIcon icon={faLink} aria-hidden="true" />
                </button>
                <button type="button" className="btn btn-outline-secondary" title="Insert code" aria-label="Insert code" onClick={() => insertTag('code')}>
                    <FontAwesomeIcon icon={faCode} aria-hidden="true" />
                </button>
                <button type="button" className="btn btn-outline-secondary" title="Insert italic" aria-label="Insert italic" onClick={() => insertTag('i')}>
                    <FontAwesomeIcon icon={faItalic} aria-hidden="true" />
                </button>
                <button type="button" className="btn btn-outline-secondary" title="Insert bold" aria-label="Insert bold" onClick={() => insertTag('strong')}>
                    <FontAwesomeIcon icon={faBold} aria-hidden="true" />
                </button>
                <button type="button" className="btn btn-outline-secondary" title="Insert line break" aria-label="Insert line break" onClick={() => insertTag('br')}>
                    <FontAwesomeIcon icon={faArrowDown} aria-hidden="true" />
                </button>
            </div>
            <textarea
                ref={textareaRef}
                className={`form-control${isInvalid ? ' is-invalid' : ''}`}
                id={id}
                name={name}
                rows={rows}
                value={value}
                onChange={handleChange}
                aria-describedby={`${id}-help`}
                required={required}
            />
            <div id={`${id}-help`} className="form-text">Only links, code, italic, bold, and line-break formatting are allowed.</div>
            {isInvalid && <div className="invalid-feedback d-block">Use only links, code, italic, bold, and line-break tags with matching opening and closing tags.</div>}
        </>
    );
}

export default ChatTextEditor;
