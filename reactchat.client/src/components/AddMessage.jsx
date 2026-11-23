import { useState } from 'react';
import ChatTextEditor from './ChatTextEditor';

function AddMessage({ parentId, onCancel }) {
    const [error, setError] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError(undefined);
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const message = {
            parentMessageId: Number(parentId),
            email: formData.get('email').trim(),
            userName: formData.get('userName').trim(),
            text: formData.get('text').trim()
        };

        try {
            const response = await fetch('/api/chat/AddMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                let message = `Request failed with status ${response.status}`;
                if (errorBody) {
                    try {
                        const problem = JSON.parse(errorBody);
                        message = problem.detail || problem.title || message;
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
            <h1 className="h2 mb-4">Add Message</h1>
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
                        pattern="[A-Z][A-Za-z0-9]*"
                        title="Start with a capital Latin letter, followed by Latin letters or digits only"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label" htmlFor="message-text">Text <span aria-hidden="true">*</span></label>
                    <ChatTextEditor id="message-text" name="text" rows="5" required />
                </div>

                {error && <div className="alert alert-danger" role="alert">Unable to add message: {error}</div>}
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || !parentId}>
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

export default AddMessage;
