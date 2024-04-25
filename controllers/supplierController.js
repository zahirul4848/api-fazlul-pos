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
exports.deleteSupplier = exports.deletePayment = exports.updatePayment = exports.updateSupplier = exports.createSupplier = exports.getSupplier = exports.getAllSupplier = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const SupplierModel_1 = __importDefault(require("../models/SupplierModel"));
// get all supplier // api/supplier // get // not protected
exports.getAllSupplier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.query.name || "";
    const nameFilter = name ? { name: { $regex: name, $options: "i" } } : {};
    try {
        const supplier = yield SupplierModel_1.default.find(Object.assign({}, nameFilter));
        res.status(201).json(supplier);
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// get a supplier // api/supplier/:id // get // protected by admin
exports.getSupplier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const supplier = yield SupplierModel_1.default.findById(req.params.id).populate("purchaseList");
        // if(supplier) {
        //   let purchaseList = [];
        //   const purchases = await supplier.purchaseList.map((purchaseId)=> {
        //     return PurchaseModel.findById(purchaseId);
        //   });
        // res.status(200).json(wishlist.concat(...products).filter(x=> x !== null))
        // }
        res.status(201).json(supplier);
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// create new supplier // api/supplier // post // protected by admin
exports.createSupplier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, contact } = req.body;
    try {
        yield SupplierModel_1.default.create({ name, contact });
        res.status(201).json({ message: "Supplier Created Successfully" });
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// update supplier // api/supplier/:id // put // protected by admin
exports.updateSupplier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const supplier = yield SupplierModel_1.default.findById(req.params.id);
    if (supplier) {
        supplier.name = req.body.name || supplier.name;
        supplier.contact = req.body.contact || supplier.contact;
        yield supplier.save();
        res.status(201).json({ message: "Supplier Updated Successfully" });
    }
    else {
        res.status(400);
        throw new Error("Supplier Not Found with this ID");
    }
}));
// due adjustment // api/supplier/updatePayment/:id // put // protected by admin
exports.updatePayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, paymentMethod } = req.body;
    const supplier = yield SupplierModel_1.default.findById(req.params.id);
    if (supplier) {
        supplier.totalPayment = Number(supplier.totalPayment + amount);
        supplier.dueAdjustment.push({
            amount: amount,
            paymentMethod: paymentMethod,
        });
        yield supplier.save();
        res.status(201).json({ message: "Supplier Payment Updated Successfully" });
    }
    else {
        res.status(400);
        throw new Error("Supplier Not Found with this ID");
    }
}));
// delete due adjustment // api/supplier/deletePayment/:supplierId/:id // delete // protected by admin
exports.deletePayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const supplier = yield SupplierModel_1.default.findById(req.params.supplierId);
    if (supplier) {
        const transaction = supplier.dueAdjustment.find((item) => item._id.toString() === req.params.id);
        if (transaction) {
            supplier.totalPayment = Number(supplier.totalPayment - transaction.amount);
            supplier.dueAdjustment = supplier.dueAdjustment.filter((item) => item._id.toString() !== req.params.id);
            yield supplier.save();
            res.status(201).json({ message: "Supplier Payment Deleted Successfully" });
        }
        else {
            res.status(400);
            throw new Error("Transaction Not Found");
        }
    }
    else {
        res.status(400);
        throw new Error("Supplier Not Found with this ID");
    }
}));
// create new supplier // api/supplier/:id // delete // protected by admin
exports.deleteSupplier = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const supplier = yield SupplierModel_1.default.findById(req.params.id);
    if (supplier) {
        yield SupplierModel_1.default.findOneAndDelete(supplier._id);
        res.status(201).json({ message: "Supplier Deleted Successfully" });
    }
    else {
        res.status(400);
        throw new Error("Supplier Not Found with this ID");
    }
}));
