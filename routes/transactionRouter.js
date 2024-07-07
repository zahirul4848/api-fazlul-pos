"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const transactionController_1 = require("../controllers/transactionController");
const router = express_1.default.Router();
router.route("/").post(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, transactionController_1.createTransaction).get(transactionController_1.getAllTransaction);
router.route("/:id").delete(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, transactionController_1.deleteTransaction).put(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, transactionController_1.updateTransaction).get(authMiddleware_1.isAuth, authMiddleware_1.isAdmin, transactionController_1.getTransaction);
exports.default = router;
