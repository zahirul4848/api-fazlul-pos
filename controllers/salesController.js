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
exports.deleteSale = exports.createSale = exports.getSale = exports.getAllSales = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const SalesModel_1 = __importDefault(require("../models/SalesModel"));
const CounterModel_1 = __importDefault(require("../models/CounterModel"));
const ProductModel_1 = __importDefault(require("../models/ProductModel"));
const CustomerModel_1 = __importDefault(require("../models/CustomerModel"));
// get all sales // api/sale // get // protected by admin
exports.getAllSales = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderNumber = req.query.orderNumber || "";
    const orderNumberFilter = orderNumber ? { orderNumber: { $regex: orderNumber, $options: "i" } } : {};
    try {
        const sales = yield SalesModel_1.default.find(Object.assign({}, orderNumberFilter)).sort({ createdAt: -1 }).populate("customer");
        res.status(201).json(sales);
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// get sales by id // api/sale/:id // get // protected by user
exports.getSale = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sale = yield SalesModel_1.default.findById(req.params.id).populate("customer");
        res.status(201).json(sale);
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// create new sale // api/sale // post // protected by user
exports.createSale = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.salesItems.length === 0) {
        res.status(400);
        throw new Error("No Product Selected");
    }
    try {
        const counter = yield CounterModel_1.default.findOneAndUpdate({}, { $inc: { seq: 1 } });
        if (!counter) {
            yield CounterModel_1.default.create({ seq: 1 });
            res.status(400);
            throw new Error("Counter Not Found, Please try again");
        }
        req.body.salesItems.forEach((salesItem) => __awaiter(void 0, void 0, void 0, function* () {
            const product = yield ProductModel_1.default.findById(salesItem._id);
            if (!product) {
                res.status(400);
                throw new Error("Product Not Found");
            }
            if (salesItem.count > product.stock) {
                res.status(400);
                throw new Error("You do not have sufficient product stock");
            }
            product.stock = Number(product.stock - salesItem.count);
            yield product.save();
        }));
        const sale = new SalesModel_1.default({
            customer: req.body.customer,
            orderNumber: counter === null || counter === void 0 ? void 0 : counter.seq,
            salesItems: req.body.salesItems,
            itemsPrice: req.body.itemsPrice,
        });
        const newSale = yield sale.save();
        // update customer
        const customer = yield CustomerModel_1.default.findById(req.body.customer);
        if (customer) {
            customer.totalSale = Number(customer.totalSale + req.body.itemsPrice);
            customer.saleList.push(newSale._id);
            yield customer.save();
        }
        else {
            res.status(404);
            throw new Error("Customer not found");
        }
        res.status(201).json({ message: "Sale Placed Successfully" });
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// delete sale by id // api/sale/:id // delete // protected by admin
exports.deleteSale = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sale = yield SalesModel_1.default.findById(req.params.id);
        if (sale) {
            // stock adjustment
            sale.salesItems.forEach((salesItem) => __awaiter(void 0, void 0, void 0, function* () {
                const product = yield ProductModel_1.default.findById(salesItem._id);
                if (product) {
                    product.stock = Number(product.stock + salesItem.count);
                    yield product.save();
                }
            }));
            // update customer
            const customer = yield CustomerModel_1.default.findById(sale.customer);
            if (customer) {
                customer.totalSale = Number(customer.totalSale - sale.itemsPrice);
                customer.saleList = customer.saleList.filter((item) => item._id !== sale._id);
                yield customer.save();
            }
            else {
                res.status(404);
                throw new Error("Customer not found");
            }
            yield SalesModel_1.default.findByIdAndDelete(req.params.id);
            res.status(201).json({ message: "Sale Successfully deleted" });
        }
        else {
            res.status(400);
            throw new Error("Sales not found");
        }
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
