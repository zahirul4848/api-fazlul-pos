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
exports.deleteCustomer = exports.deletePayment = exports.updatePayment = exports.updateCustomer = exports.createCustomer = exports.getCustomer = exports.getAllCustomer = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const CustomerModel_1 = __importDefault(require("../models/CustomerModel"));
// get all customer // api/customer // get // not protected
exports.getAllCustomer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.query.name || "";
    const nameFilter = name ? { name: { $regex: name, $options: "i" } } : {};
    try {
        const customer = yield CustomerModel_1.default.find(Object.assign({}, nameFilter));
        res.status(201).json(customer);
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// get a customer // api/customer/:id // get // protected by admin
exports.getCustomer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = yield CustomerModel_1.default.findById(req.params.id).populate("saleList");
        // if(customer) {
        //   let purchaseList = [];
        //   const purchases = await customer.purchaseList.map((purchaseId)=> {
        //     return PurchaseModel.findById(purchaseId);
        //   });
        // res.status(200).json(wishlist.concat(...products).filter(x=> x !== null))
        // }
        res.status(201).json(customer);
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// create new customer // api/customer // post // protected by admin
exports.createCustomer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, contact, address } = req.body;
    try {
        yield CustomerModel_1.default.create({ name, contact, address });
        res.status(201).json({ message: "Customer Created Successfully" });
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
}));
// update customer // api/customer/:id // put // protected by admin
exports.updateCustomer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield CustomerModel_1.default.findById(req.params.id);
    if (customer) {
        customer.name = req.body.name || customer.name;
        customer.contact = req.body.contact || customer.contact;
        customer.address = req.body.address || customer.address;
        yield customer.save();
        res.status(201).json({ message: "Customer Updated Successfully" });
    }
    else {
        res.status(400);
        throw new Error("Customer Not Found with this ID");
    }
}));
// due adjustment // api/customer/updatePayment/:id // put // protected by admin
exports.updatePayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, paymentMethod } = req.body;
    const customer = yield CustomerModel_1.default.findById(req.params.id);
    if (customer) {
        customer.totalPayment = Number(customer.totalPayment + amount);
        customer.dueAdjustment.push({
            amount: amount,
            paymentMethod: paymentMethod,
        });
        yield customer.save();
        res.status(201).json({ message: "Customer Payment Updated Successfully" });
    }
    else {
        res.status(400);
        throw new Error("Customer Not Found with this ID");
    }
}));
// delete due adjustment // api/customer/deletePayment/:customerId/:id // delete // protected by admin
exports.deletePayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield CustomerModel_1.default.findById(req.params.customerId);
    if (customer) {
        const transaction = customer.dueAdjustment.find((item) => item._id.toString() === req.params.id);
        if (transaction) {
            customer.totalPayment = Number(customer.totalPayment - transaction.amount);
            customer.dueAdjustment = customer.dueAdjustment.filter((item) => item._id.toString() !== req.params.id);
            yield customer.save();
            res.status(201).json({ message: "Customer Payment Deleted Successfully" });
        }
        else {
            res.status(400);
            throw new Error("Transaction Not Found");
        }
    }
    else {
        res.status(400);
        throw new Error("Customer Not Found with this ID");
    }
}));
// create new customer // api/customer/:id // delete // protected by admin
exports.deleteCustomer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield CustomerModel_1.default.findById(req.params.id);
    if (customer) {
        yield CustomerModel_1.default.findOneAndDelete(customer._id);
        res.status(201).json({ message: "Customer Deleted Successfully" });
    }
    else {
        res.status(400);
        throw new Error("Customer Not Found with this ID");
    }
}));
