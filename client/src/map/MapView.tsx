import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, useMapEvent } from "react-leaflet";
import { MAP_MAX_ZOOM, MAP_SIZE } from "../config";
import type { Marker as MarkerData } from "../api/types";
import { MarkerLayer } from "./MarkerLayer";

const bounds: L.LatLngBoundsExpression = [
  [0, 0],
  [MAP_SIZE, MAP_SIZE],
];

function ClickHandler({ active, onClick }: { active: boolean; onClick: (x: number, y: number) => void }) {
  useMapEvent("click", (e) => {
    if (!active) return;
    onClick(e.latlng.lng, e.latlng.lat);
  });
  return null;
}

interface MapViewProps {
  markers: MarkerData[];
  placing: boolean;
  onPlaceMarker: (x: number, y: number) => void;
  onEditMarker: (marker: MarkerData) => void;
  onDeleteMarker: (marker: MarkerData) => void;
  isAdmin: boolean;
}

export function MapView({ markers, placing, onPlaceMarker, onEditMarker, onDeleteMarker, isAdmin }: MapViewProps) {
  return (
    <MapContainer
      crs={L.CRS.Simple}
      center={[MAP_SIZE / 2, MAP_SIZE / 2]}
      zoom={1}
      minZoom={0}
      maxZoom={MAP_MAX_ZOOM}
      maxBounds={bounds}
      maxBoundsViscosity={1}
      style={{ height: "100%", width: "100%", cursor: placing ? "crosshair" : undefined }}
    >
      <TileLayer url="/tiles/{z}/{x}/{y}.png" tileSize={256} noWrap bounds={bounds} attribution="" />
      <ClickHandler active={placing} onClick={onPlaceMarker} />
      <MarkerLayer markers={markers} isAdmin={isAdmin} onEdit={onEditMarker} onDelete={onDeleteMarker} />
    </MapContainer>
  );
}
