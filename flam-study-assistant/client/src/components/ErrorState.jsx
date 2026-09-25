export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-block state-error" role="alert">
      <p className="state-error-title">Something went wrong</p>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
