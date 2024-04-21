"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const customerController_1 = require("../controllers/customerController");
const router = express_1.default.Router();
router.route("/").post(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, customerController_1.createCustomer).get(customerController_1.getAllCustomer);
router.route("/deletePayment/:customerId/:id").delete(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, customerController_1.deletePayment);
router.route("/updatePayment/:id").put(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, customerController_1.updatePayment);
router.route("/:id").delete(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, customerController_1.deleteCustomer).put(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, customerController_1.updateCustomer).get(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, customerController_1.getCustomer);
exports.default = router;
