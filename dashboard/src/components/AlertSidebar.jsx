export default function AlertSidebar({ alerts, onResolve }) {
  return (
    <aside className="panel sidebar">
      <h3>Active Alerts</h3>
      {alerts.length === 0 && <p className="muted">No active alerts.</p>}
      {alerts.map((alert) => (
        <article key={alert.id} className="alert-card">
          <strong>{alert.type}</strong>
          <p>Tourist: {alert.touristId}</p>
          <button onClick={() => onResolve(alert.id)}>Resolve</button>
        </article>
      ))}
    </aside>
  );
}
