interface NewMarkerButtonProps {
  placing: boolean;
  onToggle: () => void;
}

export function NewMarkerButton({ placing, onToggle }: NewMarkerButtonProps) {
  return (
    <button type="button" className={placing ? "new-marker-button active" : "new-marker-button"} onClick={onToggle}>
      {placing ? "Abbrechen (auf Karte klicken zum Setzen)" : "+ Neue Markierung"}
    </button>
  );
}
