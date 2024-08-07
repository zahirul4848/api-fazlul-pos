import expressAsync from "express-async-handler";
import PurchaseModel from "../models/PurchaseModel";
import CounterModel from "../models/CounterModelForPurchase";
import ProductModel from "../models/ProductModel";
import SupplierModel from "../models/SupplierModel";

// get all purchase // api/purchase // get // protected by admin
export const getAllPurchase = expressAsync(async(req, res)=> {
  const pageSize = Number(req.query.pageSize) || 0;
  const page = Number(req.query.pageNumber) || 1;
  const orderNumber = req.query.orderNumber || "";
  const orderNumberFilter = orderNumber ? {orderNumber: {$regex: orderNumber, $options: "i"}} : {};
  try {
    const count = await PurchaseModel.countDocuments({...orderNumberFilter});
    const purchaseList = await PurchaseModel.find({...orderNumberFilter}).sort({createdAt: -1}).populate({path: "supplier", select: "name"}).skip(pageSize * (page - 1)).limit(pageSize).select("-purchaseItems");
    res.status(201).json({purchaseList, pages: Math.ceil(count / pageSize)});
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
  const supplier = await SupplierModel.findById(req.body.supplier);
  if(!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }
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
    
    // update supplier 1
    if(req.body.paymentAmount > 0) {
      supplier.totalPayment = Number(supplier.totalPayment + req.body.paymentAmount);
      supplier.dueAdjustment.push({
        amount: req.body.paymentAmount,
        paymentMethod: req.body.paymentMethod,
      })
      await supplier.save();
    }
    const purchase = new PurchaseModel({
      supplier: req.body.supplier,
      orderNumber: counter?.seq,
      purchaseItems: req.body.purchaseItems,
      itemsPrice: req.body.itemsPrice,
      
      payment: req.body.paymentAmount > 0 ? {
        amount: req.body.paymentAmount,
        paymentMethod: req.body.paymentMethod,
        due: Number(req.body.itemsPrice - req.body.paymentAmount),
        dueAdjustmentId: supplier.dueAdjustment[0]._id,
      } : {},
    });

    const newPurchase = await purchase.save();
  
    // update supplier
    supplier.totalPurchase = Number(supplier.totalPurchase + req.body.itemsPrice);
    supplier.purchaseList.push(newPurchase._id);
    await supplier.save();
   
    res.status(201).json({message: "Purchase Placed Successfully"});      
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
        supplier.purchaseList = supplier.purchaseList.filter((item)=> item._id.toString() !== purchase._id.toString());
        
        if(purchase.payment?.amount > 0) {
          const item = supplier.dueAdjustment.find((item)=> 
            item._id?.toString() == purchase.payment.dueAdjustmentId.toString()
          );
          if(item) {
            supplier.totalPayment = Number(supplier.totalPayment - purchase.payment.amount);
            supplier.dueAdjustment = supplier.dueAdjustment.filter((item)=> 
              item._id?.toString() !== purchase.payment.dueAdjustmentId.toString()
            );
          }
        }        
        
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