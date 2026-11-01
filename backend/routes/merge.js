import express from "express";
import { mergeImages, parseMergeBody } from "../services/image-builder.js";

const router = express.Router();

// TODO: POST /api/merge -> création file d'attente pour la fusion
// router.post("/", (req, res) => {});

// TODO: GET /api/merge/:id -> récupérer infos file d'attente
// router.get("/:id", (req, res) => {});

// TODO: GET /api/merge/:id/result -> récupérer l'image une fois la tâche terminée
// router.get("/:id/result", (req, res) => {});

// TODO: DELETE /api/merge/:id -> annule une tâche si en attente
// router.delete("/:id", (req, res) => {});

// EX: POST /api/merge { images: [...], layout: "grid", columns: 2, ... }
router.post("/", async (req, res) => {
  const { error, images, options } = parseMergeBody(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const { buffer } = await mergeImages(images, options);
    return res
      .status(200)
      .type("image/jpeg")
      .attachment("slidesmerger-export.jpeg")
      .send(buffer);
  } catch (e) {
    console.error("Merge failed:", e);
    return res.status(502).json({ error: e.message });
  }
});

export default router;
