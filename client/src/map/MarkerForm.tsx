import { useState, type FormEvent } from "react";
import type { Category } from "../api/types";
import type { MarkerInput } from "../api/markers";

interface MarkerFormProps {
  mode: "create" | "edit";
  categories: Category[];
  initial: MarkerInput;
  onSubmit: (input: MarkerInput) => Promise<void>;
  onCancel: () => void;
}

export function MarkerForm({ mode, categories, initial, onSubmit, onCancel }: MarkerFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [categoryId, setCategoryId] = useState(initial.categoryId || categories[0]?.id || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      setError("Bitte zuerst eine Kategorie anlegen.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ title, description, categoryId, x: initial.x, y: initial.y });
    } catch {
      setError("Speichern fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{mode === "create" ? "Neue Markierung" : "Markierung bearbeiten"}</h3>

        <label>
          Titel
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} autoFocus />
        </label>

        <label>
          Beschreibung
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} />
        </label>

        <label>
          Kategorie
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" onClick={onCancel} disabled={submitting}>
            Abbrechen
          </button>
          <button type="submit" disabled={submitting || !title.trim()}>
            {mode === "create" ? "Erstellen" : "Speichern"}
          </button>
        </div>
      </form>
    </div>
  );
}
