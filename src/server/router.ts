import Router from "@koa/router";
import FileController from "./controllers/files";
import CheckFileAccessibility from "./middlewares/check-file-accessibility";

const router = new Router();

router.get("/api/list", CheckFileAccessibility, FileController.getFileList);
router.post("/api/thumbnails/regenerate", CheckFileAccessibility, FileController.regenerateThumbnails);

export default router;
