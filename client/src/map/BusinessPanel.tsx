import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../auth/AuthContext";
import type { Marker } from "../api/types";
import { formatHoursMinutes, isCollectOnCooldown, remainingCollectMs, useNow, WARNING_THRESHOLD_MS } from "./business";

interface BusinessPanelProps {
  businesses: Marker[];
  isAdmin: boolean;
  onCollect: (id: string) => Promise<void>;
  onDelete: (marker: Marker) => void;
}

/** Collapsible bottom-right panel listing every "Unternehmen" marker with its 24h collect
 *  timer. Rendered via a portal directly into <body> — same reasoning as CategoryFilter's menu:
 *  Leaflet's transform-based panes create their own stacking context independent of z-index, so
 *  a same-tree position:fixed element risks ending up behind the map. */
export function BusinessPanel({ businesses, isAdmin, onCollect, onDelete }: BusinessPanelProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const now = useNow(30_000);

  if (businesses.length === 0) return null;

  return createPortal(
    <div className="business-panel">
      {open && (
        <div className="business-panel-list">
          <h3>Unternehmen in Besitz</h3>
          {businesses.map((marker) => {
            const remaining = remainingCollectMs(marker, now);
            const cooldown = isCollectOnCooldown(marker, now);
            const warning = remaining < WARNING_THRESHOLD_MS;

            return (
              <div className="business-row" key={marker.id}>
                <div className="business-row-info">
                  <span className="business-row-name">{marker.title}</span>
                  <span className={warning ? "business-row-timer business-row-timer-warning" : "business-row-timer"}>
                    {formatHoursMinutes(remaining)}
                  </span>
                </div>
                <div className="business-row-actions">
                  {user && (
                    <button type="button" disabled={cooldown} onClick={() => void onCollect(marker.id)}>
                      Abholen
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      className="danger business-row-delete"
                      aria-label={`${marker.title} löschen`}
                      onClick={() => onDelete(marker)}
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button type="button" className="business-panel-toggle" onClick={() => setOpen((o) => !o)}>
        Unternehmen ({businesses.length})
      </button>
    </div>,
    document.body
  );
}
