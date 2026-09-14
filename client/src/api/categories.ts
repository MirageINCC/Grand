import { apiFetch } from "./client";
import type { Category } from "./types";

export function listCategories(): Promise<Category[]> {
  return apiFetch("/api/categories");
}

export function createCategory(input: { name: string; color: string }): Promise<Category> {
  return apiFetch("/api/categories", { method: "POST", body: JSON.stringify(input) });
}

export function updateCategory(id: string, input: Partial<{ name: string; color: string }>): Promise<Category> {
  return apiFetch(`/api/categories/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteCategory(id: string): Promise<void> {
  return apiFetch(`/api/categories/${id}`, { method: "DELETE" });
}
