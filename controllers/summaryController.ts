import expressAsync from "express-async-handler";
import { Request, Response } from "express";
import SalesModel from "../models/SalesModel";
import ProductModel from "../models/ProductModel";
import CategoryModel from "../models/CategoryModel";
import PurchaseModel from "../models/PurchaseModel";
import UserModel from "../models/UserModel";
import CustomerModel from "../models/CustomerModel";
import SupplierModel from "../models/SupplierModel";
import TransactionModel from "../models/TransactionModel";

// get all summary // api/summary // get // not protected
export const getSummary = expressAsync(async(req: Request, res: Response)=> {
  
  try {
    const monthlySales = await SalesModel.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt"
            }
          },
          numOrders: {$sum: 1},
          totalSales: {$sum: '$itemsPrice'}
        }
      }
    ]).limit(12);
    const monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const monthlySalesArray = monthlySales.map((monthlySale)=> {
      return {...monthlySale, month: monthArray[monthlySale._id.month - 1]};
    });
    const salesMonth = monthlySalesArray.map((item)=> {
      return item.month;
    });
    const salesMonthTotal = monthlySalesArray.map((item)=> {
      return Number(item.totalSales / 100000).toFixed(2);
    });

    // number of products
    const products = await ProductModel.aggregate([
      {
        $group: {
          _id: null,
          numberOfProducts: {$sum: 1},
        }
      }
    ]);
    // number of categories
    const categories = await CategoryModel.aggregate([
      {
        $group: {
          _id: null,
          numberOfCategories: {$sum: 1},
        }
      }
    ]);
    // number of sales
    const sales = await SalesModel.aggregate([
      {
        $group: {
          _id: null,
          numberOfSales: {$sum: 1},
        }
      }
    ]);
    // number of purchase
    const purchase = await PurchaseModel.aggregate([
      {
        $group: {
          _id: null,
          numberOfPurchase: {$sum: 1},
        }
      }
    ]);
    // number of users
    const users = await UserModel.aggregate([
      {
        $group: {
          _id: null,
          numberOfUsers: {$sum: 1},
        }
      }
    ]);
    // number of customers
    const customers = await CustomerModel.aggregate([
      {
        $group: {
          _id: null,
          numberOfCustomers: {$sum: 1},
        }
      }
    ]);
    // number of suppliers
    const suppliers = await SupplierModel.aggregate([
      {
        $group: {
          _id: null,
          numberOfSuppliers: {$sum: 1},
        }
      }
    ]);

    // total items price
    const totalItemsPrice = await ProductModel.aggregate([
      {
        $group: { 
            _id: null,
            total: {$sum: {$multiply: ["$price", "$stock"]}}
        }
      }
    ])
    // total sales due
    const totalSalesDue = await CustomerModel.aggregate([
      {
        $group: { 
            _id: null,
            total: {$sum: {$subtract: ["$totalSale", "$totalPayment"]}}
        }
      }
    ])
    
    // total sales payment
    const totalSalesPayment = await CustomerModel.aggregate([
      { $unwind: "$dueAdjustment" },
      {
        $group: {
          _id: "$dueAdjustment.paymentMethod",
          value: { $sum: "$dueAdjustment.amount" }
        }
      },
    ])
    
    // total purchase due
    const totalPurchaseDue = await SupplierModel.aggregate([
      {
        $group: { 
            _id: null,
            total: {$sum: {$subtract: ["$totalPurchase", "$totalPayment"]}}
        }
      }
    ])
    
    // total purchase payment
    const totalPurchasePayment = await SupplierModel.aggregate([
      { $unwind: "$dueAdjustment" },
      {
        $group: {
          _id: "$dueAdjustment.paymentMethod",
          value: { $sum: "$dueAdjustment.amount" }
        }
      },
    ])

    // transaction

    const transactionData = await TransactionModel.aggregate([
      {
        $group: {
          _id: '$transactionType',
          total: { $sum: "$amount" }
        }
      }
    ]);

    res.status(201).json({
      monthlySalesArray, 
      salesMonth, 
      salesMonthTotal, 
      products,
      sales,
      users,
      purchase,
      categories,
      customers,
      suppliers,
      totalItemsPrice,
      totalSalesDue,
      totalSalesPayment,
      totalPurchaseDue,
      totalPurchasePayment,
      transactionData
    });
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})

// get day wise sales // api/summary // get // not protected
export const getDayWiseSales = expressAsync(async(req: Request, res: Response)=> {
  let date = req.query.datePicker as any;
  let startDate = new Date(new Date(date).setHours(0,0,0,0));
  let endDate = new Date(new Date(date).setHours(23,59,59,999));
    
  try {
    const dayWiseSales = await SalesModel.find({createdAt: {$gte: startDate, $lt: endDate}}).populate("customer");
    res.status(201).json(dayWiseSales);
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})
