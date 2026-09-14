import type { Marker } from "../api/types";
import { CategoryBadge } from "./CategoryBadge";

interface MarkerPopupProps {
  marker: Marker;
  isAdmin: boolean;
  onEdit: (marker: Marker) => void;
  onDelete: (marker: Marker) => void;
}

export function MarkerPopup({ marker, isAdmin, onEdit, onDelete }: MarkerPopupProps) {
  return (
    <div className="marker-popup">
      <h3>{marker.title}</h3>
      <CategoryBadge category={marker.category} />
      {marker.description && <p>{marker.description}</p>}
      <p className="marker-meta">Erstellt von {marker.createdByName}</p>
      {isAdmin && (
        <div className="marker-popup-actions">
          <button type="button" onClick={() => onEdit(marker)}>
            Bearbeiten
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              if (confirm(`"${marker.title}" wirklich löschen?`)) onDelete(marker);
            }}
          >
            Löschen
          </button>
        </div>
      )}
    </div>
  );
}
