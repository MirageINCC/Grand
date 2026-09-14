import { useState, type FormEvent } from "react";
import type { Category } from "../api/types";

interface CategoryManagerProps {
  categories: Category[];
  onCreate: (input: { name: string; color: string }) => Promise<void>;
  onUpdate: (id: string, input: { name: string; color: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function CategoryManager({ categories, onCreate, onUpdate, onDelete, onClose }: CategoryManagerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#e63946");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onCreate({ name: name.trim(), color });
      setName("");
    } catch {
      setError("Kategorie konnte nicht angelegt werden (Name evtl. schon vergeben).");
    }
  }

  async function handleDelete(id: string) {
    try {
      await onDelete(id);
    } catch {
      setError("Kategorie wird noch von Markierungen verwendet und kann nicht gelöscht werden.");
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Kategorien verwalten</h3>

        <ul className="category-list">
          {categories.map((c) => (
            <li key={c.id}>
              <input
                type="color"
                value={c.color}
                onChange={(e) => void onUpdate(c.id, { name: c.name, color: e.target.value })}
              />
              <input
                value={c.name}
                onChange={(e) => void onUpdate(c.id, { name: e.target.value, color: c.color })}
              />
              <button type="button" className="danger" onClick={() => void handleDelete(c.id)}>
                Löschen
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={handleCreate} className="category-create-form">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <input
            placeholder="Neue Kategorie"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
          />
          <button type="submit">Hinzufügen</button>
        </form>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
