"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransaction = exports.deleteTransaction = exports.createTransaction = exports.getTransaction = exports.getAllTransaction = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const TransactionModel_1 = __importDefault(require("../models/TransactionModel"));
// get all transaction // api/transaction // get // not protected
exports.getAllTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield TransactionModel_1.default.find().sort({ createdAt: -1 });
        res.status(201).json(transactions);
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// get a transaction // api/transaction/:id // get // protected by admin
exports.getTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaction = yield TransactionModel_1.default.findById(req.params.id);
        res.status(201).json(transaction);
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// create new transaction // api/transaction // post // protected by admin
exports.createTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { transactionType, amount, remarks } = req.body;
    try {
        yield TransactionModel_1.default.create({ transactionType, amount, remarks });
        res.status(201).json({ message: "Transaction Created Successfully" });
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// delete new transaction // api/transaction/:id // delete // protected by admin
exports.deleteTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield TransactionModel_1.default.findById(req.params.id);
    if (transaction) {
        yield TransactionModel_1.default.findOneAndDelete(transaction._id);
        res.status(201).json({ message: "Transaction Deleted Successfully" });
    }
    else {
        res.status(400);
        throw new Error("Transaction Not Found with this ID");
    }
}));
// update transaction // api/transaction/:id // put // protected by admin
exports.updateTransaction = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield TransactionModel_1.default.findById(req.params.id);
    if (transaction) {
        transaction.transactionType = req.body.transactionType || transaction.transactionType;
        transaction.amount = req.body.amount || transaction.amount;
        transaction.remarks = req.body.remarks || transaction.remarks;
        yield transaction.save();
        res.status(201).json({ message: "Transaction Updated Successfully" });
    }
    else {
        res.status(400);
        throw new Error("Transaction Not Found with this ID");
    }
}));
