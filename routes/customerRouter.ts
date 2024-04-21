import express from "express";
import {isAuth, isAdmin} from "../middleware/authMiddleware";
import { createCustomer, deletePayment, deleteCustomer, getAllCustomer, getCustomer, updatePayment, updateCustomer } from "../controllers/customerController";

const router = express.Router();

router.route("/").post(isAuth, isAdmin, createCustomer).get(getAllCustomer);
router.route("/deletePayment/:customerId/:id").delete(isAuth, isAdmin, deletePayment);
router.route("/updatePayment/:id").put(isAuth, isAdmin, updatePayment);
router.route("/:id").delete(isAuth, isAdmin, deleteCustomer).put(isAuth, isAdmin, updateCustomer).get(isAuth, isAdmin, getCustomer);


export default router;