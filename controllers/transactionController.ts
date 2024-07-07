import expressAsync from "express-async-handler";
import TransactionModel from "../models/TransactionModel";
import { Request, Response } from "express";

// get all transaction // api/transaction // get // not protected
export const getAllTransaction = expressAsync(async(req: Request, res: Response)=> {
  try {
    const transactions = await TransactionModel.find().sort({createdAt: -1});
    res.status(201).json(transactions);
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})

// get a transaction // api/transaction/:id // get // protected by admin
export const getTransaction = expressAsync(async(req: Request, res: Response)=> {
  try {
    const transaction = await TransactionModel.findById(req.params.id);
    res.status(201).json(transaction);
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})

// create new transaction // api/transaction // post // protected by admin
export const createTransaction = expressAsync(async(req: Request, res: Response)=> {
  const {transactionType, amount, remarks} = req.body;
  try {
    await TransactionModel.create({transactionType, amount, remarks});
    res.status(201).json({message: "Transaction Created Successfully"});
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }  
})

// delete new transaction // api/transaction/:id // delete // protected by admin
export const deleteTransaction = expressAsync(async(req: Request, res: Response)=> {
  const transaction = await TransactionModel.findById(req.params.id);
  if(transaction) {
    await TransactionModel.findOneAndDelete(transaction._id);
    res.status(201).json({message: "Transaction Deleted Successfully"})
  } else {
    res.status(400);
    throw new Error("Transaction Not Found with this ID");
  }
})


// update transaction // api/transaction/:id // put // protected by admin
export const updateTransaction = expressAsync(async(req: Request, res: Response)=> {
  const transaction = await TransactionModel.findById(req.params.id);
  if(transaction) {
    transaction.transactionType = req.body.transactionType || transaction.transactionType;
    transaction.amount = req.body.amount || transaction.amount;
    transaction.remarks = req.body.remarks || transaction.remarks;
    await transaction.save();
    res.status(201).json({message: "Transaction Updated Successfully"});
  } else {
    res.status(400);
    throw new Error("Transaction Not Found with this ID");
  }  
})