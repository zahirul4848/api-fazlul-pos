import express from "express";
import {isAuth, isAdmin} from "../middleware/authMiddleware";
import { createTransaction, deleteTransaction, getAllTransaction, getTransaction, updateTransaction } from "../controllers/transactionController";

const router = express.Router();

router.route("/").post(isAuth, isAdmin, createTransaction).get(getAllTransaction);
router.route("/:id").delete(isAuth, isAdmin, deleteTransaction).put(isAuth, isAdmin, updateTransaction).get(isAuth, isAdmin, getTransaction);


export default router;