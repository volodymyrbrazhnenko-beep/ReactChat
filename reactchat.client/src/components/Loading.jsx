function Loading({ message = 'Loading...' }) {
    return (
        <div className="d-flex justify-content-center align-items-center py-5" role="status">
            <div className="spinner-border text-primary me-3" aria-hidden="true" />
            <span>{message}</span>
        </div>
    );
}

export default Loading;
