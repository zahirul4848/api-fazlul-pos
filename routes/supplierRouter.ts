import express from "express";
import {isAuth, isAdmin} from "../middleware/authMiddleware";
import { createSupplier, deletePayment, deleteSupplier, getAllSupplier, getSupplier, updatePayment, updateSupplier } from "../controllers/supplierController";

const router = express.Router();

router.route("/").post(isAuth, isAdmin, createSupplier).get(getAllSupplier);
router.route("/deletePayment/:supplierId/:id").delete(isAuth, isAdmin, deletePayment);
router.route("/updatePayment/:id").put(isAuth, isAdmin, updatePayment);
router.route("/:id").delete(isAuth, isAdmin, deleteSupplier).put(isAuth, isAdmin, updateSupplier).get(isAuth, isAdmin, getSupplier);


export default router;