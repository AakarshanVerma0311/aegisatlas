import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet';
import { useMemo, useState } from 'react';
import AlertSidebar from '../components/AlertSidebar.jsx';
import StatsBar from '../components/StatsBar.jsx';
import EFIRModal from '../components/EFIRModal.jsx';

const defaultCenter = [28.6139, 77.2090];

export default function MapScreen({ tourists, alerts, onResolve, onGenerateEFIR }) {
  const [selectedTourist, setSelectedTourist] = useState(null);
  const breadcrumb = useMemo(() => selectedTourist?.breadcrumb || [], [selectedTourist]);

  return (
    <div className="dashboard-layout">
      <AlertSidebar alerts={alerts} onResolve={onResolve} />
      <section className="map-section">
        <StatsBar touristCount={tourists.length} alertCount={alerts.length} />
        <div className="tourist-list panel">
          <h3>Tourists</h3>
          {tourists.map((tourist) => (
            <button key={tourist.id} onClick={() => setSelectedTourist(tourist)}>
              {tourist.name}
            </button>
          ))}
        </div>
        <MapContainer center={selectedTourist?.coords || defaultCenter} zoom={13} className="live-map">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {tourists
            .filter((tourist) => tourist.coords)
            .map((tourist) => <Marker key={tourist.id} position={tourist.coords} />)}
          {breadcrumb.length > 1 && <Polyline positions={breadcrumb} color="#ff4757" />}
        </MapContainer>
        <button className="efir-trigger" disabled={!selectedTourist} onClick={() => onGenerateEFIR(selectedTourist)}>
          Auto Draft E-FIR
        </button>
      </section>
      <EFIRModal
        isOpen={Boolean(selectedTourist)}
        tourist={selectedTourist}
        onClose={() => setSelectedTourist(null)}
        onGenerate={onGenerateEFIR}
      />
    </div>
  );
}
