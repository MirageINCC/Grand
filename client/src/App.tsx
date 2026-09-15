import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { LoginButton } from "./auth/LoginButton";
import { listCategories, createCategory, updateCategory, deleteCategory } from "./api/categories";
import { listMarkers, createMarker, updateMarker, deleteMarker, type MarkerInput } from "./api/markers";
import type { Category, Marker } from "./api/types";
import { MapView } from "./map/MapView";
import { MarkerForm } from "./map/MarkerForm";
import { CategoryManager } from "./map/CategoryManager";

function AppContent() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null);
  const [editingMarker, setEditingMarker] = useState<Marker | null>(null);
  const [managingCategories, setManagingCategories] = useState(false);

  async function refresh() {
    const [cats, marks] = await Promise.all([listCategories(), listMarkers()]);
    setCategories(cats);
    setMarkers(marks);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleCreateSubmit(input: MarkerInput) {
    const marker = await createMarker(input);
    setMarkers((prev) => [marker, ...prev]);
    setDraft(null);
  }

  async function handleEditSubmit(input: MarkerInput) {
    if (!editingMarker) return;
    const updated = await updateMarker(editingMarker.id, input);
    setMarkers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditingMarker(null);
  }

  async function handleDeleteMarker(marker: Marker) {
    await deleteMarker(marker.id);
    setMarkers((prev) => prev.filter((m) => m.id !== marker.id));
  }

  return (
    <div className="app">
      <header className="toolbar">
        <h1>GTA 5 Karte</h1>
        <div className="toolbar-actions">
          {isAdmin && (
            <button type="button" onClick={() => setManagingCategories(true)}>
              Kategorien
            </button>
          )}
          <LoginButton />
        </div>
      </header>

      <main className="map-container">
        <MapView
          markers={markers}
          isAdmin={isAdmin}
          onPlaceMarker={(x, y) => setDraft({ x, y })}
          onEditMarker={setEditingMarker}
          onDeleteMarker={(marker) => void handleDeleteMarker(marker)}
        />
      </main>

      {draft && (
        <MarkerForm
          mode="create"
          categories={categories}
          initial={{ title: "", description: "", categoryId: "", x: draft.x, y: draft.y }}
          onSubmit={handleCreateSubmit}
          onCancel={() => setDraft(null)}
        />
      )}

      {editingMarker && (
        <MarkerForm
          mode="edit"
          categories={categories}
          initial={{
            title: editingMarker.title,
            description: editingMarker.description,
            categoryId: editingMarker.categoryId,
            x: editingMarker.x,
            y: editingMarker.y,
          }}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingMarker(null)}
        />
      )}

      {managingCategories && (
        <CategoryManager
          categories={categories}
          onCreate={async (input) => {
            await createCategory(input);
            await refresh();
          }}
          onUpdate={async (id, input) => {
            await updateCategory(id, input);
            await refresh();
          }}
          onDelete={async (id) => {
            await deleteCategory(id);
            await refresh();
          }}
          onClose={() => setManagingCategories(false)}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
