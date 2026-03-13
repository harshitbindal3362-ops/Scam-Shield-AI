import { Router, type IRouter } from "express";
import healthRouter from "./health";
import honeypotRouter from "./honeypot/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/honeypot", honeypotRouter);

export default router;
