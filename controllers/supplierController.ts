import expressAsync from "express-async-handler";
import SupplierModel from "../models/SupplierModel";
import { Request, Response } from "express";


// get all supplier // api/supplier // get // not protected
export const getAllSupplier = expressAsync(async(req: Request, res: Response)=> {
  const name = req.query.name || "";
  const nameFilter = name ? {name: {$regex: name, $options: "i"}} : {};
  try {
    const supplier = await SupplierModel.find({...nameFilter});
    res.status(201).json(supplier);
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})

// get a supplier // api/supplier/:id // get // protected by admin
export const getSupplier = expressAsync(async(req: Request, res: Response)=> {
  try {
    const supplier = await SupplierModel.findById(req.params.id).populate("purchaseList");
    // if(supplier) {
    //   let purchaseList = [];
    //   const purchases = await supplier.purchaseList.map((purchaseId)=> {
    //     return PurchaseModel.findById(purchaseId);
    //   });
      
      // res.status(200).json(wishlist.concat(...products).filter(x=> x !== null))
    // }
    res.status(201).json(supplier);
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})

// create new supplier // api/supplier // post // protected by admin
export const createSupplier = expressAsync(async(req: Request, res: Response)=> {
  const {name, contact} = req.body;
  try {
    await SupplierModel.create({name, contact});
    res.status(201).json({message: "Supplier Created Successfully"});
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})

// update supplier // api/supplier/:id // put // protected by admin
export const updateSupplier = expressAsync(async(req: Request, res: Response)=> {
  const supplier = await SupplierModel.findById(req.params.id);
  if(supplier) {
    supplier.name = req.body.name || supplier.name;
    supplier.contact = req.body.contact || supplier.contact;
    await supplier.save();
    res.status(201).json({message: "Supplier Updated Successfully"});
  } else {
    res.status(400);
    throw new Error("Supplier Not Found with this ID");
  }  
})

// due adjustment // api/supplier/updatePayment/:id // put // protected by admin
export const updatePayment = expressAsync(async(req: Request, res: Response)=> {
  const {amount, paymentMethod} = req.body;
  const supplier = await SupplierModel.findById(req.params.id);
  if(supplier) {
    supplier.totalPayment = Number(supplier.totalPayment + amount);
    supplier.dueAdjustment.push({
      amount: amount,
      paymentMethod: paymentMethod,
    })
    await supplier.save();
    res.status(201).json({message: "Supplier Payment Updated Successfully"});
  } else {
    res.status(400);
    throw new Error("Supplier Not Found with this ID");
  }
})

// delete due adjustment // api/supplier/deletePayment/:supplierId/:id // delete // protected by admin
export const deletePayment = expressAsync(async(req: Request, res: Response)=> {
  const supplier = await SupplierModel.findById(req.params.supplierId);
  if(supplier) {
    const transaction = supplier.dueAdjustment.find((item: any)=> item._id.toString() === req.params.id);
    if(transaction) {
      supplier.totalPayment = Number(supplier.totalPayment - transaction.amount);
      
      supplier.dueAdjustment = supplier.dueAdjustment.filter((item: any)=> item._id.toString() !== req.params.id);

      await supplier.save();
      res.status(201).json({message: "Supplier Payment Deleted Successfully"});
    } else {
      res.status(400);
      throw new Error("Transaction Not Found");
    }
  } else {
    res.status(400);
    throw new Error("Supplier Not Found with this ID");
  }
})

// create new supplier // api/supplier/:id // delete // protected by admin
export const deleteSupplier = expressAsync(async(req: Request, res: Response)=> {
  const supplier = await SupplierModel.findById(req.params.id);
  if(supplier) {
    await SupplierModel.findOneAndDelete(supplier._id);
    res.status(201).json({message: "Supplier Deleted Successfully"})
  } else {
    res.status(400);
    throw new Error("Supplier Not Found with this ID");
  }
})
