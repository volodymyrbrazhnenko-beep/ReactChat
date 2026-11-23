import { useState } from 'react';
import ChatTextEditor from './ChatTextEditor';

function AddChatTitle({ onCancel }) {
    const [error, setError] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError(undefined);

        const formData = new FormData(event.currentTarget);
        const files = formData.getAll('files').filter(file => file instanceof File && file.name !== '');
        if (files.length > 8) {
            setError('A chat title can have at most 8 files.');
            return;
        }
        if (files.some(file => file.name.toLowerCase().endsWith('.txt') && file.size > 100 * 1024)) {
            setError('Text files must not exceed 100 KB.');
            return;
        }

        setIsSubmitting(true);

        formData.set('email', formData.get('email').trim());
        formData.set('userName', formData.get('userName').trim());
        formData.set('title', formData.get('title').trim());
        formData.set('text', formData.get('text') || '');

        try {
            const response = await fetch('/api/chat/AddTitle', {
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

    return (
        <section className="page mx-auto" style={{ maxWidth: '640px' }}>
            <h1 className="h2 mb-4">Add Chat Title</h1>
            <form className="card card-body" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label" htmlFor="chat-title-email">eMail <span aria-hidden="true">*</span></label>
                    <input className="form-control" id="chat-title-email" name="email" type="email" maxLength="200" required />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="chat-title-user-name">User Name <span aria-hidden="true">*</span></label>
                    <input
                        className="form-control"
                        id="chat-title-user-name"
                        name="userName"
                        type="text"
                        maxLength="200"
                        pattern="[A-Z][A-Za-z0-9]*(?: [A-Z][A-Za-z0-9]*){0,2}"
                        title="Enter one to three words, each starting with a capital Latin letter and containing only Latin letters or digits"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="chat-title-title">Title <span aria-hidden="true">*</span></label>
                    <input className="form-control" id="chat-title-title" name="title" type="text" maxLength="400" required />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="chat-title-text">Text</label>
                    <ChatTextEditor id="chat-title-text" name="text" rows="5" />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="chat-title-files">Files and pictures (up to 8; .txt up to 100 KB; images scaled to fit 320 × 240)</label>
                    <input className="form-control" id="chat-title-files" name="files" type="file" accept=".txt,.jpg,.gif,.png" multiple />
                </div>

                {error && <div className="alert alert-danger" role="alert">Unable to add chat title: {error}</div>}
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );
}

export default AddChatTitle;
