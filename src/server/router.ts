import Router from "koa-router";
import File from "./file";

const router = new Router();

router.get("/api/list", File.getFileList);

export default router;
