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
exports.deletePurchase = exports.createPurchase = exports.getPurchase = exports.getAllPurchase = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const PurchaseModel_1 = __importDefault(require("../models/PurchaseModel"));
const CounterModelForPurchase_1 = __importDefault(require("../models/CounterModelForPurchase"));
const ProductModel_1 = __importDefault(require("../models/ProductModel"));
const SupplierModel_1 = __importDefault(require("../models/SupplierModel"));
// get all purchase // api/purchase // get // protected by admin
exports.getAllPurchase = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderNumber = req.query.orderNumber || "";
    const orderNumberFilter = orderNumber ? { orderNumber: { $regex: orderNumber, $options: "i" } } : {};
    try {
        const purchaseList = yield PurchaseModel_1.default.find(Object.assign({}, orderNumberFilter)).sort({ createdAt: -1 }).populate("supplier");
        res.status(201).json(purchaseList);
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// get purchase by id // api/purchase/:id // get // protected by user
exports.getPurchase = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const purchase = yield PurchaseModel_1.default.findById(req.params.id).populate("supplier");
        res.status(201).json(purchase);
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// create new purchase // api/purchase // post // protected by user
exports.createPurchase = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.purchaseItems.length === 0) {
        res.status(400);
        throw new Error("No Product Selected");
    }
    try {
        const counter = yield CounterModelForPurchase_1.default.findOneAndUpdate({}, { $inc: { seq: 1 } });
        if (!counter) {
            yield CounterModelForPurchase_1.default.create({ seq: 1 });
            res.status(400);
            throw new Error("Counter Not Found, Please try again");
        }
        req.body.purchaseItems.forEach((purchaseItem) => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield ProductModel_1.default.findById(purchaseItem._id);
            if (!product) {
                res.status(400);
                throw new Error("Product Not Found");
            }
            product.stock = Number(product.stock + purchaseItem.count);
            yield product.save();
        }));
        const purchase = new PurchaseModel_1.default({
            supplier: req.body.supplier,
            orderNumber: counter === null || counter === void 0 ? void 0 : counter.seq,
            purchaseItems: req.body.purchaseItems,
            itemsPrice: req.body.itemsPrice,
        });
        const newPurchase = yield purchase.save();
        // update supplier
        const supplier = yield SupplierModel_1.default.findById(req.body.supplier);
        if (supplier) {
            supplier.totalPurchase = Number(supplier.totalPurchase + req.body.itemsPrice);
            supplier.purchaseList.push(newPurchase._id);
            yield supplier.save();
        }
        else {
            res.status(404);
            throw new Error("Supplier not found");
        }
        res.status(201).json({
            message: "Purchase Placed Successfully",
        });
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// delete purchase by id // api/purchase/:id // delete // protected by admin
exports.deletePurchase = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const purchase = yield PurchaseModel_1.default.findById(req.params.id);
        if (purchase) {
            // stock adjustment
            purchase.purchaseItems.forEach((purchaseItem) => __awaiter(void 0, void 0, void 0, function* () {
                const product = yield ProductModel_1.default.findById(purchaseItem._id);
                if (product) {
                    product.stock = Number(product.stock - purchaseItem.count);
                    yield product.save();
                }
            }));
            // update supplier
            const supplier = yield SupplierModel_1.default.findById(purchase.supplier);
            if (supplier) {
                supplier.totalPurchase = Number(supplier.totalPurchase - purchase.itemsPrice);
                supplier.purchaseList = supplier.purchaseList.filter((item) => item._id !== purchase._id);
                yield supplier.save();
            }
            else {
                res.status(404);
                throw new Error("Supplier not found");
            }
            yield PurchaseModel_1.default.findByIdAndDelete(req.params.id);
            res.status(201).json({ message: "Purchase Successfully Deleted" });
        }
        else {
            res.status(400);
            throw new Error("Purchase not found");
        }
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
