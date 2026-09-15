import { Marker, Popup } from "react-leaflet";
import type { Marker as MarkerData } from "../api/types";
import { categoryIcon, warningIcon } from "./markerIcon";
import { MarkerPopup } from "./MarkerPopup";
import { isBusinessMarker, remainingCollectMs, useNow, WARNING_THRESHOLD_MS } from "./business";

interface MarkerLayerProps {
  markers: MarkerData[];
  isAdmin: boolean;
  onEdit: (marker: MarkerData) => void;
  onDelete: (marker: MarkerData) => void;
}

export function MarkerLayer({ markers, isAdmin, onEdit, onDelete }: MarkerLayerProps) {
  // Only business markers care about this, but a single shared tick is cheap and keeps this
  // component's re-render cadence simple regardless of how many businesses exist.
  const now = useNow(30_000);

  return (
    <>
      {markers.map((marker) => {
        const icon =
          isBusinessMarker(marker) && remainingCollectMs(marker, now) < WARNING_THRESHOLD_MS
            ? warningIcon()
            : categoryIcon(marker.category.color);

        return (
          <Marker key={marker.id} position={[marker.y, marker.x]} icon={icon}>
            <Popup>
              <MarkerPopup marker={marker} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
