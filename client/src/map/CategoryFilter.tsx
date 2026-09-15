import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Category } from "../api/types";

interface CategoryFilterProps {
  categories: Category[];
  hiddenCategoryIds: Set<string>;
  onToggle: (categoryId: string) => void;
}

/** Dropdown with a checkbox per category, letting anyone viewing the map
 *  (not just admins — this only affects what's shown to them, not the data)
 *  show/hide markers by category.
 *
 *  The menu itself is rendered into a portal at the end of <body> rather
 *  than inline: Leaflet's panes use CSS transforms for panning/zooming,
 *  which create their own stacking context regardless of z-index, and could
 *  end up painted above a same-page dropdown nested under the toolbar. A
 *  portal sidesteps that entirely — it isn't a descendant of the map at all. */
export function CategoryFilter({ categories, hiddenCategoryIds, onToggle }: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPos({ top: rect.bottom + 10, right: window.innerWidth - rect.right });
    }

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const hiddenCount = categories.filter((c) => hiddenCategoryIds.has(c.id)).length;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Filter{hiddenCount > 0 ? ` (${hiddenCount} aus)` : ""}
      </button>

      {open &&
        createPortal(
          <div className="filter-menu" ref={menuRef} style={{ top: menuPos.top, right: menuPos.right }}>
            {categories.length === 0 ? (
              <p className="filter-empty">Keine Kategorien vorhanden.</p>
            ) : (
              categories.map((c) => (
                <label key={c.id} className="filter-option">
                  <input type="checkbox" checked={!hiddenCategoryIds.has(c.id)} onChange={() => onToggle(c.id)} />
                  <span className="filter-dot" style={{ background: c.color }} />
                  {c.name}
                </label>
              ))
            )}
          </div>,
          document.body
        )}
    </>
  );
}
