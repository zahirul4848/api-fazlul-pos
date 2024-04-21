import expressAsync from "express-async-handler";
import PurchaseModel from "../models/PurchaseModel";
import CounterModel from "../models/CounterModelForPurchase";
import ProductModel from "../models/ProductModel";
import SupplierModel from "../models/SupplierModel";

// get all purchase // api/purchase // get // protected by admin
export const getAllPurchase = expressAsync(async(req, res)=> {
  const orderNumber = req.query.orderNumber || "";
  const orderNumberFilter = orderNumber ? {orderNumber: {$regex: orderNumber, $options: "i"}} : {};
  try {
    const purchaseList = await PurchaseModel.find({...orderNumberFilter}).sort({createdAt: -1}).populate("supplier");
    res.status(201).json(purchaseList);
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})

// get purchase by id // api/purchase/:id // get // protected by user
export const getPurchase = expressAsync(async(req, res)=> {
  try {
    const purchase = await PurchaseModel.findById(req.params.id).populate("supplier");
    res.status(201).json(purchase);
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
});

// create new purchase // api/purchase // post // protected by user
export const createPurchase = expressAsync(async(req, res)=> {
  if(req.body.purchaseItems.length === 0) {
    res.status(400);
    throw new Error("No Product Selected");
  } 
  try {
    const counter = await CounterModel.findOneAndUpdate( {}, {$inc: { seq: 1} },);
    if(!counter) {
      await CounterModel.create({seq: 1});
      res.status(400);
      throw new Error("Counter Not Found, Please try again");
    }
    req.body.purchaseItems.forEach(async(purchaseItem: any)=> {
      const product = await ProductModel.findById(purchaseItem._id);
      if(!product) {
        res.status(400);
        throw new Error("Product Not Found");
      }
      product.stock = Number(product.stock + purchaseItem.count);
      await product.save();
    });
    const purchase = new PurchaseModel({
      supplier: req.body.supplier,
      orderNumber: counter?.seq,
      purchaseItems: req.body.purchaseItems,
      itemsPrice: req.body.itemsPrice,
    });

    const newPurchase = await purchase.save();
  
    // update supplier
    const supplier = await SupplierModel.findById(req.body.supplier);
    if(supplier) {
      supplier.totalPurchase = Number(supplier.totalPurchase + req.body.itemsPrice);
      supplier.purchaseList.push(newPurchase._id);
      await supplier.save();
    } else {
      res.status(404);
      throw new Error("Supplier not found");
    }
   
    res.status(201).json({
      message: "Purchase Placed Successfully",
    });      
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
});

// delete purchase by id // api/purchase/:id // delete // protected by admin
export const deletePurchase = expressAsync(async(req, res)=> {
  try {
    const purchase = await PurchaseModel.findById(req.params.id);
    if(purchase) {
      // stock adjustment
      purchase.purchaseItems.forEach(async(purchaseItem: any)=> {
        const product = await ProductModel.findById(purchaseItem._id);
        if(product) {
          product.stock = Number(product.stock - purchaseItem.count);
          await product.save();
        }
      });
      
      // update supplier
      const supplier = await SupplierModel.findById(purchase.supplier);
      if(supplier) {
        supplier.totalPurchase = Number(supplier.totalPurchase - purchase.itemsPrice);
        supplier.purchaseList.filter((item)=> item._id !== purchase._id);
        await supplier.save();
      } else {
        res.status(404);
        throw new Error("Supplier not found");
      }

      await PurchaseModel.findByIdAndDelete(req.params.id);
      res.status(201).json({message: "Purchase Successfully Deleted"});
    } else {
      res.status(400);
      throw new Error("Purchase not found");
    }
    
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})