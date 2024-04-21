import mongoose, {Document, Schema, Types} from "mongoose";

export interface IDueAdjustment {
  paymentMethod: string;
  amount: number;
}

export interface ISupplier extends Document {
  name: string;
  contact: string;
  totalPurchase: number;
  totalPayment: number;
  dueAdjustment: IDueAdjustment[];
  purchaseList: {_id: Types.ObjectId}[];
}

const dueAdjustmentSchema: Schema<IDueAdjustment> = new Schema({
  paymentMethod: {type: String, required: true},
  amount: {type: Number, required: true},
}, {timestamps: true});


const supplierSchema: Schema<ISupplier> = new Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
  },
  totalPurchase: {
    type: Number,
    default: 0,
  },
  totalPayment: {
    type: Number,
    default: 0,
  },
  dueAdjustment: [dueAdjustmentSchema],
  purchaseList: [
    {
      type: Schema.Types.ObjectId,
      ref: "Purchase"
    },
  ]
}, {
  timestamps: true,
});


export default mongoose.model("Supplier", supplierSchema);