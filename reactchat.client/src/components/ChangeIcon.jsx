import { useState } from 'react';

const maxUploadSize = 10 * 1024 * 1024;

function resizeToIcon(file) {
    return createImageBitmap(file).then(bitmap => new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 80;
        const context = canvas.getContext('2d');
        if (!context) {
            bitmap.close();
            reject(new Error('Unable to prepare the customer icon.'));
            return;
        }

        context.drawImage(bitmap, 0, 0, 80, 80);
        bitmap.close();
        canvas.toBlob(blob => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Unable to encode the customer icon.'));
            }
        }, 'image/png');
    }));
}

async function errorMessageFromResponse(response) {
    const responseText = await response.text();
    return responseText || `Request failed with status ${response.status}.`;
}

function ChangeIcon({ customerId, hasIcon, onClose, onChanged }) {
    const [file, setFile] = useState();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState();

    async function uploadIcon(event) {
        event.preventDefault();
        if (!file) {
            setError('Choose an image to upload.');
            return;
        }
        if (file.size > maxUploadSize) {
            setError('Choose an image smaller than 10 MB.');
            return;
        }

        setIsSaving(true);
        setError(undefined);
        try {
            const png = await resizeToIcon(file);
            const formData = new FormData();
            formData.append('icon', png, 'customer-icon.png');
            const response = await fetch(`/api/chat/CustomerIcon/${customerId}`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error(await errorMessageFromResponse(response));
            }

            onChanged(true);
            onClose();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSaving(false);
        }
    }

    async function removeIcon() {
        setIsSaving(true);
        setError(undefined);
        try {
            const response = await fetch(`/api/chat/CustomerIcon/${customerId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error(await errorMessageFromResponse(response));
            }

            onChanged(false);
            onClose();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="change-icon-backdrop" role="presentation">
            <section className="change-icon-dialog" role="dialog" aria-modal="true" aria-labelledby="change-icon-title">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h2 className="h4 mb-0" id="change-icon-title">Change Customer Icon</h2>
                    <button type="button" className="btn-close" aria-label="Close" onClick={onClose} disabled={isSaving} />
                </div>
                {hasIcon && (
                    <div className="mb-3">
                        <img
                            className="change-icon-preview"
                            src={`/api/chat/CustomerIcon/${customerId}`}
                            alt="Current customer icon"
                            width="80"
                            height="80"
                        />
                    </div>
                )}
                <form onSubmit={uploadIcon}>
                    <label className="form-label" htmlFor="customer-icon-file">Upload an image (saved as 80 × 80 pixels)</label>
                    <input
                        className="form-control mb-3"
                        id="customer-icon-file"
                        type="file"
                        accept="image/*"
                        onChange={event => setFile(event.target.files?.[0])}
                        disabled={isSaving}
                    />
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <div className="d-flex justify-content-end gap-2">
                        {hasIcon && (
                            <button type="button" className="btn btn-outline-danger me-auto" onClick={removeIcon} disabled={isSaving}>
                                Remove Icon
                            </button>
                        )}
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving || !file}>
                            {isSaving ? 'Saving...' : 'Upload Icon'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default ChangeIcon;
