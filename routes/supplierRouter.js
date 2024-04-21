"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const supplierController_1 = require("../controllers/supplierController");
const router = express_1.default.Router();
router.route("/").post(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, supplierController_1.createSupplier).get(supplierController_1.getAllSupplier);
router.route("/deletePayment/:supplierId/:id").delete(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, supplierController_1.deletePayment);
router.route("/updatePayment/:id").put(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, supplierController_1.updatePayment);
router.route("/:id").delete(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, supplierController_1.deleteSupplier).put(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, supplierController_1.updateSupplier).get(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, supplierController_1.getSupplier);
exports.default = router;
