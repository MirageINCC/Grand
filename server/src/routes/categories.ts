import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const categoriesRouter = Router();

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "color must be a hex code like #ff5733");

const categoryInput = z.object({
  name: z.string().trim().min(1).max(60),
  color: hexColor,
});

categoriesRouter.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(categories);
});

categoriesRouter.post("/", requireAdmin, async (req, res) => {
  const parsed = categoryInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const category = await prisma.category.create({ data: parsed.data });
    res.status(201).json(category);
  } catch {
    res.status(409).json({ error: "A category with that name already exists" });
  }
});

categoriesRouter.patch("/:id", requireAdmin, async (req, res) => {
  const parsed = categoryInput.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(category);
  } catch {
    res.status(404).json({ error: "Category not found" });
  }
});

categoriesRouter.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "P2003" || code === "P2014") {
      res.status(409).json({ error: "Category is still used by existing markers" });
      return;
    }
    res.status(404).json({ error: "Category not found" });
  }
});
