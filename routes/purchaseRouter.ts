import express from "express";
import {isAuth, isAdmin} from "../middleware/authMiddleware";
import { createPurchase, deletePurchase, getAllPurchase, getPurchase } from "../controllers/purchaseController";

const router = express.Router();

router.route("/").post(isAuth, isAdmin, createPurchase).get(isAuth, isAdmin, getAllPurchase);
router.route("/:id").delete(isAuth, isAdmin, deletePurchase).get(isAuth, isAdmin, getPurchase);


export default router;