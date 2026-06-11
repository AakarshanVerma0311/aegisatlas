import { useState } from 'react';

export default function EFIRModal({ isOpen, tourist, onClose, onGenerate }) {
  const [narrative, setNarrative] = useState('');

  if (!isOpen || !tourist) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h3>E-FIR Draft</h3>
        <p>Tourist: {tourist.name}</p>
        <textarea
          value={narrative}
          onChange={(event) => setNarrative(event.target.value)}
          placeholder="Add incident summary"
          rows={5}
        />
        <div className="modal-actions">
          <button onClick={() => onGenerate({ touristId: tourist.id, narrative })}>Generate</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
