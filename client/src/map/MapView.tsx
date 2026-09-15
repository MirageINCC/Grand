import { useLayoutEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, useMap, useMapEvent } from "react-leaflet";
import { MAP_CONTENT_HEIGHT, MAP_CONTENT_WIDTH, MAP_MAX_ZOOM } from "../config";
import type { Marker as MarkerData } from "../api/types";
import { MarkerLayer } from "./MarkerLayer";

// The real map content only fills a MAP_CONTENT_WIDTH x MAP_CONTENT_HEIGHT
// corner of the full [0, MAP_SIZE] world (see config.ts) when the source
// image wasn't square — everything beyond that is transparent padding the
// tile generator added to reach a power-of-two square. Bounding to the
// actual content keeps panning and the fill-viewport zoom below from
// wandering into (or fitting to) that blank area.
const bounds: L.LatLngBoundsExpression = [
  [0, 0],
  [MAP_CONTENT_HEIGHT, MAP_CONTENT_WIDTH],
];

// L.CRS.Simple's default transformation negates lat when converting to pixel
// space (point.y = -lat), so it expects "north" (higher lat/y) to be *up*.
// Our tile pyramid (generate-tiles.ts) numbers tiles the normal image way —
// y=0 at the top, increasing downward — so with the stock CRS the map always
// requests tiles outside the generated range (e.g. y=-1, y=-2 at zoom 1) and
// never shows anything. Dropping the sign flip aligns the two: positive y now
// means "down", matching both the tile grid and how marker.x/marker.y are
// stored (validated as [0, MAP_SIZE] in server/src/routes/markers.ts).
const crs = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
});

// The map content's aspect ratio rarely matches the browser viewport's — at
// a zoom that merely fits one axis, the other leaves an empty gray margin
// (visible as bars beside/above the map). This keeps the map zoomed in just
// far enough to cover *both* viewport dimensions — like CSS
// `background-size: cover` — so there's never blank space, while maxBounds
// still stops panning off the generated tiles. Re-evaluated on every window
// resize.
function FitToViewport() {
  const map = useMap();

  useLayoutEffect(() => {
    function apply() {
      map.invalidateSize();
      const { x: width, y: height } = map.getSize();
      const coverZoom = Math.max(Math.log2(width / MAP_CONTENT_WIDTH), Math.log2(height / MAP_CONTENT_HEIGHT));
      const minZoom = Math.min(Math.max(coverZoom, 0), MAP_MAX_ZOOM);
      map.setMinZoom(minZoom);
      if (map.getZoom() < minZoom) {
        map.setZoom(minZoom);
      }
    }

    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [map]);

  return null;
}

// Only mounted for admins (see below) — a click on an existing Marker never
// reaches here, Leaflet stops that event from bubbling up to the map itself.
function ClickHandler({ onClick }: { onClick: (x: number, y: number) => void }) {
  useMapEvent("click", (e) => {
    onClick(e.latlng.lng, e.latlng.lat);
  });
  return null;
}

interface MapViewProps {
  markers: MarkerData[];
  onPlaceMarker: (x: number, y: number) => void;
  onEditMarker: (marker: MarkerData) => void;
  onDeleteMarker: (marker: MarkerData) => void;
  isAdmin: boolean;
}

export function MapView({ markers, onPlaceMarker, onEditMarker, onDeleteMarker, isAdmin }: MapViewProps) {
  return (
    <MapContainer
      crs={crs}
      center={[MAP_CONTENT_HEIGHT / 2, MAP_CONTENT_WIDTH / 2]}
      zoom={1}
      minZoom={0}
      maxZoom={MAP_MAX_ZOOM}
      zoomSnap={0}
      maxBounds={bounds}
      maxBoundsViscosity={1}
      style={{ height: "100%", width: "100%", cursor: isAdmin ? "crosshair" : undefined }}
    >
      <TileLayer url="/tiles/{z}/{x}/{y}.png" tileSize={256} noWrap bounds={bounds} attribution="" />
      <FitToViewport />
      {isAdmin && <ClickHandler onClick={onPlaceMarker} />}
      <MarkerLayer markers={markers} isAdmin={isAdmin} onEdit={onEditMarker} onDelete={onDeleteMarker} />
    </MapContainer>
  );
}
