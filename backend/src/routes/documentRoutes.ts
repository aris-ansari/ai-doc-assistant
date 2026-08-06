import { Router } from "express";
import { documentController } from "../controllers/documentController";
import { authenticate } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

// Protect all document routes
router.use(authenticate);

router.post(
  "/upload",
  upload.single("file"),
  documentController.uploadDocument,
);
router.get("/", documentController.getDocuments);
router.get("/:id", documentController.getDocumentById);
router.delete("/:id", documentController.deleteDocument);

export default router;
