import expressAsync from "express-async-handler";
import SalesModel from "../models/SalesModel";
import CounterModel from "../models/CounterModel";
import ProductModel from "../models/ProductModel";
import CustomerModel from "../models/CustomerModel";

// get all sales // api/sale // get // protected by admin
export const getAllSales = expressAsync(async(req, res)=> {
  const orderNumber = req.query.orderNumber || "";
  const orderNumberFilter = orderNumber ? {orderNumber: {$regex: orderNumber, $options: "i"}} : {};
  try {
    const sales = await SalesModel.find({...orderNumberFilter}).sort({createdAt: -1}).populate("customer");
    res.status(201).json(sales);
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})

// get sales by id // api/sale/:id // get // protected by user
export const getSale = expressAsync(async(req, res)=> {
  try {
    const sale = await SalesModel.findById(req.params.id).populate("customer");
    res.status(201).json(sale);
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})

// create new sale // api/sale // post // protected by user
export const createSale = expressAsync(async(req, res)=> {
  const customer = await CustomerModel.findById(req.body.customer);
  if(!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }
  if(req.body.salesItems.length === 0) {
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
    req.body.salesItems.forEach(async(salesItem: any)=> {
      const product = await ProductModel.findById(salesItem._id);
      if(!product) {
        res.status(400);
        throw new Error("Product Not Found");
      }
      if(salesItem.count > product.stock) {
        res.status(400);
        throw new Error("You do not have sufficient product stock");
      }
      product.stock = Number(product.stock - salesItem.count);
      await product.save();
    });
    // update customer 1
    if(req.body.paymentAmount > 0) {
      customer.totalPayment = Number(customer.totalPayment + req.body.paymentAmount);
      customer.dueAdjustment.push({
        amount: req.body.paymentAmount,
        paymentMethod: req.body.paymentMethod,
      })
      await customer.save();
    }
    const sale = new SalesModel({
      customer: req.body.customer,
      orderNumber: counter?.seq,
      salesItems: req.body.salesItems,
      itemsPrice: req.body.itemsPrice,
      
      payment: req.body.paymentAmount > 0 ? {
        amount: req.body.paymentAmount,
        paymentMethod: req.body.paymentMethod,
        due: Number(req.body.itemsPrice - req.body.paymentAmount),
        dueAdjustmentId: customer.dueAdjustment[0]._id,
      } : {},
    });
    const newSale = await sale.save();

    // update customer 2
    customer.totalSale = Number(customer.totalSale + req.body.itemsPrice);
    customer.saleList.push(newSale._id);
    await customer.save();

    res.status(201).json({message: "Sale Placed Successfully"});
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
});


// delete sale by id // api/sale/:id // delete // protected by admin
export const deleteSale = expressAsync(async(req, res)=> {
  try {
    const sale = await SalesModel.findById(req.params.id);
    if(sale) {
      // stock adjustment
      sale.salesItems.forEach(async(salesItem: any)=> {
        const product = await ProductModel.findById(salesItem._id);
        if(product) {
          product.stock = Number(product.stock + salesItem.count);
          await product.save();
        }
      });
      // update customer
      const customer = await CustomerModel.findById(sale.customer);
      if(customer) {
        customer.totalSale = Number(customer.totalSale - sale.itemsPrice);
        customer.saleList = customer.saleList.filter((item)=> 
          item._id.toString() !== sale._id.toString()
        );
        
        if(sale.payment?.amount > 0) {
          const item = customer.dueAdjustment.find((item)=> 
            item._id?.toString() == sale.payment.dueAdjustmentId.toString()
          );
          if(item) {
            customer.totalPayment = Number(customer.totalPayment - sale.payment.amount);
            customer.dueAdjustment = customer.dueAdjustment.filter((item)=> 
              item._id?.toString() !== sale.payment.dueAdjustmentId.toString()
            );
          }
        }
        
        await customer.save();
      } else {
        res.status(404);
        throw new Error("Customer not found");
      }
      await SalesModel.findByIdAndDelete(req.params.id);
      res.status(201).json({message: "Sale Successfully deleted"});
    } else {
      res.status(400);
      throw new Error("Sales not found");
    }
    
  } catch (err: any) {
    res.status(400);
    throw new Error(err.message);
  }
})





