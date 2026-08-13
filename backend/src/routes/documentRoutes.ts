import { Router } from "express";
import { documentController } from "../controllers/documentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { z } from "zod";

const router = Router();

const documentIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid document ID"),
  }),
});

router.use(authenticate);

router.post(
  "/upload",
  upload.single("file"),
  documentController.uploadDocument,
);
router.get("/", documentController.getDocuments);
router.get(
  "/:id",
  validate(documentIdSchema),
  documentController.getDocumentById,
);
router.post(
  "/:id/retry",
  validate(documentIdSchema),
  documentController.retryDocument,
);
router.delete(
  "/:id",
  validate(documentIdSchema),
  documentController.deleteDocument,
);

export default router;
