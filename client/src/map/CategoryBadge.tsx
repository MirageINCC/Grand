import type { Category } from "../api/types";

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: "#fff",
        background: category.color,
      }}
    >
      {category.name}
    </span>
  );
}
