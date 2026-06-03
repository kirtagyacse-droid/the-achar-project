export default function Loading() {
  return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div className="loading-spinner" style={{
        margin: '0 auto 20px',
        width: '40px',
        height: '40px',
        border: '3px solid var(--border-light)',
        borderTopColor: 'var(--color-accent)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Preparing Achar Club...
      </p>
    </div>
  );
}
