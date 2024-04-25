import mongoose, {Document, Schema, Types} from "mongoose";

export interface IDueAdjustment {
  _id?: string;
  paymentMethod: string;
  amount: number;
}

export interface ICustomer extends Document {
  name: string;
  contact: string;
  address: string;
  totalSale: number;
  totalPayment: number;
  dueAdjustment: IDueAdjustment[];
  saleList: {_id: Types.ObjectId}[];
}

const dueAdjustmentSchema: Schema<IDueAdjustment> = new Schema({
  paymentMethod: {type: String, required: true},
  amount: {type: Number, required: true},
}, {timestamps: true});


const customerSchema: Schema<ICustomer> = new Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
  },
  address: {
    type: String,
  },
  totalSale: {
    type: Number,
    default: 0,
  },
  totalPayment: {
    type: Number,
    default: 0,
  },
  dueAdjustment: [dueAdjustmentSchema],
  saleList: [
    {
      type: Schema.Types.ObjectId,
      ref: "Sale"
    },
  ]
}, {
  timestamps: true,
});


export default mongoose.model("Customer", customerSchema);