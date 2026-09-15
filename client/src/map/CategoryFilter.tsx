import { useEffect, useRef, useState } from "react";
import type { Category } from "../api/types";

interface CategoryFilterProps {
  categories: Category[];
  hiddenCategoryIds: Set<string>;
  onToggle: (categoryId: string) => void;
}

/** Dropdown with a checkbox per category, letting anyone viewing the map
 *  (not just admins — this only affects what's shown to them, not the data)
 *  show/hide markers by category. */
export function CategoryFilter({ categories, hiddenCategoryIds, onToggle }: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const hiddenCount = categories.filter((c) => hiddenCategoryIds.has(c.id)).length;

  return (
    <div className="filter-dropdown" ref={rootRef}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="true">
        Filter{hiddenCount > 0 ? ` (${hiddenCount} aus)` : ""}
      </button>

      {open && (
        <div className="filter-menu">
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
        </div>
      )}
    </div>
  );
}
