import mongoose, {Document, Schema} from "mongoose";

export interface ISales extends Document {
  customer: Schema.Types.ObjectId;
  salesItems: {
    _id: Schema.Types.ObjectId;
    title: string;
    price: number;
    category: string;
    count: number;
  }[];
  orderNumber: string;
  itemsPrice: number;
  payment: {
    amount: number;
    paymentMethod: string;
    due: number;
    dueAdjustmentId: string;
  };
  previousDue: number;
}

const salesSchema: Schema<ISales> = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer"
  },
  salesItems: [
    {
      _id: {type: Schema.Types.ObjectId},
      title: {type: String},
      price: {type: Number},
      category: {type: String},
      count: {type: Number}
    }
  ],
  orderNumber: {
    type: String,
    unique: true,
  },
  itemsPrice: {
    type: Number, 
    required: true,
  },
  payment: {
    amount: {type: Number}, 
    paymentMethod: {type: String},
    due: {type: Number},
    dueAdjustmentId: {type: String}
  },
  previousDue: {
    type: Number, 
    required: true,
  },
}, {
  timestamps: true
})


export default mongoose.model("Sale", salesSchema);