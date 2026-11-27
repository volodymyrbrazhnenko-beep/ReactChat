import { useState } from 'react';
import ChatTextEditor from './ChatTextEditor';
import { renderChatText } from './chatText';

function AddMessage({ parentId, onCancel }) {
    const [error, setError] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [text, setText] = useState('');
    const [previewText, setPreviewText] = useState();

    async function handleSubmit(event) {
        event.preventDefault();
        setError(undefined);

        const formData = new FormData(event.currentTarget);
        const files = formData.getAll('files').filter(file => file instanceof File && file.name !== '');
        if (files.length > 8) {
            setError('A message can have at most 8 files.');
            return;
        }
        const textExtensions = ['.txt', '.php', '.cs', '.c', '.css', '.js', '.jsx', '.json', '.http', '.cshttp', '.sql'];
        if (files.some(file => textExtensions.some(extension => file.name.toLowerCase().endsWith(extension)) && file.size > 100 * 1024)) {
            setError('Text and code files must not exceed 100 KB.');
            return;
        }

        setIsSubmitting(true);

        if (parentId !== null) {
            formData.set('parentMessageId', String(Number(parentId)));
        } else {
            formData.set('title', formData.get('title').trim());
        }
        formData.set('email', formData.get('email').trim());
        formData.set('userName', formData.get('userName').trim());
        formData.set('text', formData.get('text').trim());

        try {
            const action = parentId === null ? 'AddTitle' : 'AddMessage';
            const response = await fetch(`/api/chat/${action}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorBody = await response.text();
                let message = `Request failed with status ${response.status}`;
                if (errorBody) {
                    try {
                        const problem = JSON.parse(errorBody);
                        message = typeof problem === 'string' ? problem : problem.detail || problem.title || message;
                    } catch {
                        message = errorBody;
                    }
                }
                throw new Error(message);
            }

            onCancel();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    const isRootMessage = parentId === null;

    return (
        <section className="page mx-auto" style={{ maxWidth: '640px' }}>
            <h1 className="h2 mb-4">{isRootMessage ? 'Add Chat Title' : 'Add Message'}</h1>
            <form className="card card-body" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label" htmlFor="message-email">eMail <span aria-hidden="true">*</span></label>
                    <input className="form-control" id="message-email" name="email" type="email" maxLength="200" required />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="message-user-name">User Name <span aria-hidden="true">*</span></label>
                    <input
                        className="form-control"
                        id="message-user-name"
                        name="userName"
                        type="text"
                        maxLength="200"
                        pattern="[A-Z][A-Za-z0-9]*(?: [A-Z][A-Za-z0-9]*){0,2}"
                        title="Enter one to three words, each starting with a capital Latin letter and containing only Latin letters or digits"
                        required
                    />
                </div>

                {isRootMessage && (
                    <div className="mb-3">
                        <label className="form-label" htmlFor="message-title">Title <span aria-hidden="true">*</span></label>
                        <input className="form-control" id="message-title" name="title" type="text" maxLength="400" required />
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label" htmlFor="message-text">Text {!isRootMessage && <span aria-hidden="true">*</span>}</label>
                    <ChatTextEditor
                        id="message-text"
                        name="text"
                        rows="5"
                        required={!isRootMessage}
                        value={text}
                        onChange={setText}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="message-files">Files and pictures (up to 8; text and code files up to 100 KB; images scaled to fit 320 × 240)</label>
                    <input className="form-control" id="message-files" name="files" type="file" accept=".txt,.php,.cs,.c,.css,.js,.jsx,.json,.http,.cshttp,.sql,.jpg,.gif,.png" multiple />
                </div>

                {error && <div className="alert alert-danger" role="alert">Unable to add {isRootMessage ? 'chat title' : 'message'}: {error}</div>}
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setPreviewText(text)}>
                        Preview
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </button>
                </div>
                {previewText !== undefined && (
                    <div className="card mt-3" aria-live="polite">
                        <div className="card-header">Preview</div>
                        <div className="card-body chat-message-text">
                            {renderChatText(previewText)}
                        </div>
                    </div>
                )}
            </form>
        </section>
    );
}

export default AddMessage;
