import { useState } from 'react';

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
        <section className="page form-page">
            <h1>Add Message</h1>
            <form className="chat-title-form" onSubmit={handleSubmit}>
                <label htmlFor="message-email">eMail <span aria-hidden="true">*</span></label>
                <input id="message-email" name="email" type="email" maxLength="200" required />

                <label htmlFor="message-user-name">User Name <span aria-hidden="true">*</span></label>
                <input id="message-user-name" name="userName" type="text" maxLength="200" required />

                <label htmlFor="message-text">Text <span aria-hidden="true">*</span></label>
                <textarea id="message-text" name="text" required />

                {error && <p className="status-message error" role="alert">Unable to add message: {error}</p>}
                <div className="form-actions">
                    <button type="submit" disabled={isSubmitting || !parentId}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                    <button type="button" className="secondary-button" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );
}

export default AddMessage;
