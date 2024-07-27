import expressAsync from "express-async-handler";
import CustomerModel from "../models/CustomerModel";
import { Request, Response } from "express";


// get all customer // api/customer // get // not protected
export const getAllCustomer = expressAsync(async(req: Request, res: Response)=> {
  const name = req.query.name || "";
  const nameFilter = name ? {name: {$regex: name, $options: "i"}} : {};
  try {
    const customer = await CustomerModel.find({...nameFilter}).select("-dueAdjustment");
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})

// get a customer // api/customer/:id // get // protected by admin
export const getCustomer = expressAsync(async(req: Request, res: Response)=> {
  try {
    const customer = await CustomerModel.findById(req.params.id).populate("saleList");
    // if(customer) {
    //   let purchaseList = [];
    //   const purchases = await customer.purchaseList.map((purchaseId)=> {
    //     return PurchaseModel.findById(purchaseId);
    //   });
      
      // res.status(200).json(wishlist.concat(...products).filter(x=> x !== null))
    // }
    res.status(201).json(customer);
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})

// create new customer // api/customer // post // protected by admin
export const createCustomer = expressAsync(async(req: Request, res: Response)=> {
  const {name, contact, address} = req.body;
  try {
    await CustomerModel.create({name, contact, address});
    res.status(201).json({message: "Customer Created Successfully"});
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})

// update customer // api/customer/:id // put // protected by admin
export const updateCustomer = expressAsync(async(req: Request, res: Response)=> {
  const customer = await CustomerModel.findById(req.params.id);
  if(customer) {
    customer.name = req.body.name || customer.name;
    customer.contact = req.body.contact || customer.contact;
    customer.address = req.body.address || customer.address;
    await customer.save();
    res.status(201).json({message: "Customer Updated Successfully"});
  } else {
    res.status(400);
    throw new Error("Customer Not Found with this ID");
  }  
})

// due adjustment // api/customer/updatePayment/:id // put // protected by admin
export const updatePayment = expressAsync(async(req: Request, res: Response)=> {
  const {amount, paymentMethod} = req.body;
  const customer = await CustomerModel.findById(req.params.id);
  if(customer) {
    customer.totalPayment = Number(customer.totalPayment + amount);
    customer.dueAdjustment.push({
      amount: amount,
      paymentMethod: paymentMethod,
    })
    await customer.save();
    res.status(201).json({message: "Customer Payment Updated Successfully"});
  } else {
    res.status(400);
    throw new Error("Customer Not Found with this ID");
  }
})

// delete due adjustment // api/customer/deletePayment/:customerId/:id // delete // protected by admin
export const deletePayment = expressAsync(async(req: Request, res: Response)=> {
  const customer = await CustomerModel.findById(req.params.customerId);
  if(customer) {
    const transaction = customer.dueAdjustment.find((item: any)=> item._id.toString() === req.params.id);
    if(transaction) {
      customer.totalPayment = Number(customer.totalPayment - transaction.amount);
      
      customer.dueAdjustment = customer.dueAdjustment.filter((item: any)=> item._id.toString() !== req.params.id);

      await customer.save();
      res.status(201).json({message: "Customer Payment Deleted Successfully"});
    } else {
      res.status(400);
      throw new Error("Transaction Not Found");
    }
  } else {
    res.status(400);
    throw new Error("Customer Not Found with this ID");
  }
})

// create new customer // api/customer/:id // delete // protected by admin
export const deleteCustomer = expressAsync(async(req: Request, res: Response)=> {
  const customer = await CustomerModel.findById(req.params.id);
  if(customer) {
    await CustomerModel.findOneAndDelete(customer._id);
    res.status(201).json({message: "Customer Deleted Successfully"})
  } else {
    res.status(400);
    throw new Error("Customer Not Found with this ID");
  }
})
