export default function StatsBar({ touristCount, alertCount }) {
  return (
    <section className="stats-bar">
      <div className="stat">
        <span>Authenticated Tourists</span>
        <strong>{touristCount}</strong>
      </div>
      <div className="stat">
        <span>Open Alerts</span>
        <strong>{alertCount}</strong>
      </div>
    </section>
  );
}
