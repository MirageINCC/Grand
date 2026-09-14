import { Marker, Popup } from "react-leaflet";
import type { Marker as MarkerData } from "../api/types";
import { categoryIcon } from "./markerIcon";
import { MarkerPopup } from "./MarkerPopup";

interface MarkerLayerProps {
  markers: MarkerData[];
  isAdmin: boolean;
  onEdit: (marker: MarkerData) => void;
  onDelete: (marker: MarkerData) => void;
}

export function MarkerLayer({ markers, isAdmin, onEdit, onDelete }: MarkerLayerProps) {
  return (
    <>
      {markers.map((marker) => (
        <Marker key={marker.id} position={[marker.y, marker.x]} icon={categoryIcon(marker.category.color)}>
          <Popup>
            <MarkerPopup marker={marker} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
          </Popup>
        </Marker>
      ))}
    </>
  );
}
