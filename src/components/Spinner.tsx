export function Spinner({ label }: { label?: string }) {
  return (
    <div className="center-screen" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      {label && <p className="muted">{label}</p>}
    </div>
  );
}
