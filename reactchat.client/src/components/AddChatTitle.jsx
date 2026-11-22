import { useState } from 'react';

function AddChatTitle({ onCancel }) {
    const [error, setError] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError(undefined);
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const title = {
            email: formData.get('email').trim(),
            userName: formData.get('userName').trim(),
            title: formData.get('title').trim(),
            text: formData.get('text') || null
        };

        try {
            const response = await fetch('/api/chat/AddTitle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(title)
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
            <h1>Add Chat Title</h1>
            <form className="chat-title-form" onSubmit={handleSubmit}>
                <label htmlFor="chat-title-email">eMail <span aria-hidden="true">*</span></label>
                <input id="chat-title-email" name="email" type="email" maxLength="200" required />

                <label htmlFor="chat-title-user-name">User Name <span aria-hidden="true">*</span></label>
                <input id="chat-title-user-name" name="userName" type="text" maxLength="200" required />

                <label htmlFor="chat-title-title">Title <span aria-hidden="true">*</span></label>
                <input id="chat-title-title" name="title" type="text" maxLength="400" required />

                <label htmlFor="chat-title-text">Text</label>
                <textarea id="chat-title-text" name="text" />

                {error && <p className="status-message error" role="alert">Unable to add chat title: {error}</p>}
                <div className="form-actions">
                    <button type="submit" disabled={isSubmitting}>
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

export default AddChatTitle;
