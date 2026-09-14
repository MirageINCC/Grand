import { Router } from "express";
import { z } from "zod";
import { MAP_SIZE } from "../config.js";
import { prisma } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const markersRouter = Router();

const coordinate = z.number().min(0).max(MAP_SIZE);

const markerInput = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(""),
  x: coordinate,
  y: coordinate,
  categoryId: z.string().uuid(),
});

markersRouter.get("/", async (_req, res) => {
  const markers = await prisma.marker.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(markers);
});

markersRouter.post("/", requireAdmin, async (req, res) => {
  const parsed = markerInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const marker = await prisma.marker.create({
      data: {
        ...parsed.data,
        createdBy: req.user!.id,
        createdByName: req.user!.username,
      },
      include: { category: true },
    });
    res.status(201).json(marker);
  } catch (error) {
    if ((error as { code?: string }).code === "P2003") {
      res.status(400).json({ error: "categoryId does not exist" });
      return;
    }
    throw error;
  }
});

markersRouter.patch("/:id", requireAdmin, async (req, res) => {
  const parsed = markerInput.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const marker = await prisma.marker.update({
      where: { id: req.params.id },
      data: parsed.data,
      include: { category: true },
    });
    res.json(marker);
  } catch (error) {
    if ((error as { code?: string }).code === "P2003") {
      res.status(400).json({ error: "categoryId does not exist" });
      return;
    }
    res.status(404).json({ error: "Marker not found" });
  }
});

markersRouter.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await prisma.marker.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Marker not found" });
  }
});
