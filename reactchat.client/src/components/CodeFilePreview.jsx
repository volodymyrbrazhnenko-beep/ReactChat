import { useEffect, useState } from 'react';

const CODE_EXTENSIONS = new Set(['.txt', '.php', '.cs', '.c', '.css', '.js', '.jsx', '.json', '.http', '.cshttp', '.sql']);
const KEYWORDS = new Set([
    'abstract', 'as', 'async', 'await', 'base', 'break', 'bool', 'byte', 'case', 'catch', 'char', 'class', 'const',
    'continue', 'decimal', 'default', 'delegate', 'delete', 'do', 'double', 'else', 'enum', 'export', 'extends',
    'false', 'finally', 'float', 'for', 'foreach', 'from', 'function', 'get', 'global', 'goto', 'if', 'implements',
    'import', 'in', 'instanceof', 'int', 'interface', 'internal', 'is', 'let', 'lock', 'long', 'namespace', 'new',
    'null', 'object', 'operator', 'out', 'override', 'package', 'private', 'protected', 'public', 'readonly', 'record',
    'return', 'sbyte', 'sealed', 'set', 'short', 'static', 'string', 'struct', 'switch', 'this', 'throw', 'true', 'try',
    'typeof', 'uint', 'ulong', 'ushort', 'using', 'var', 'virtual', 'void', 'volatile', 'where', 'while', 'with',
    'echo', 'include', 'require', 'isset', 'array', 'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE',
    'ALTER', 'TABLE', 'JOIN', 'ON', 'AS', 'AND', 'OR', 'NOT', 'NULL', 'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT'
]);

export function isCodeFile(fileName) {
    const dot = fileName.lastIndexOf('.');
    return dot >= 0 && CODE_EXTENSIONS.has(fileName.slice(dot).toLowerCase());
}

function highlightCode(source) {
    const tokenPattern = /(\/\*[\s\S]*?\*\/|\/\/[^\r\n]*|#[^\r\n]*(?:\r?\n|$)|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b[A-Za-z_$][\w$]*\b|\b\d+(?:\.\d+)?\b|<\/?[A-Za-z][\w.-]*)/g;
    const parts = [];
    let position = 0;

    for (const match of source.matchAll(tokenPattern)) {
        if (match.index > position) {
            parts.push(source.slice(position, match.index));
        }

        const token = match[0];
        let className = '';
        if (token.startsWith('/*') || token.startsWith('//') || token.startsWith('#')) {
            className = 'code-comment';
        } else if (/^["'`]/.test(token)) {
            className = 'code-string';
        } else if (/^<\/?/.test(token)) {
            className = 'code-tag';
        } else if (/^\d/.test(token)) {
            className = 'code-number';
        } else if (KEYWORDS.has(token) || KEYWORDS.has(token.toUpperCase())) {
            className = 'code-keyword';
        }

        parts.push(className ? <span className={className} key={`${match.index}-${token}`}>{token}</span> : token);
        position = match.index + token.length;
    }

    if (position < source.length) {
        parts.push(source.slice(position));
    }
    return parts;
}

function CodeFilePreview({ file }) {
    const [source, setSource] = useState();
    const [error, setError] = useState();

    useEffect(() => {
        let cancelled = false;
        setSource(undefined);
        setError(undefined);

        fetch(file.url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Unable to load file (${response.status}).`);
                }
                return response.text();
            })
            .then(text => {
                if (!cancelled) {
                    setSource(text);
                }
            })
            .catch(requestError => {
                if (!cancelled) {
                    setError(requestError.message);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [file.url]);

    return (
        <div className="chat-code-file">
            <div className="chat-code-file-header">
                <span>{file.name}</span>
                <a href={file.url} download={file.name}>Download</a>
            </div>
            {error && <div className="alert alert-danger mb-0">{error}</div>}
            {!error && source === undefined && <div className="chat-code-loading">Loading...</div>}
            {source !== undefined && (
                <div className="chat-code-preview" role="textbox" aria-readonly="true" tabIndex="0">
                    <code>{highlightCode(source)}</code>
                </div>
            )}
        </div>
    );
}

export default CodeFilePreview;
