import mongoose, {Document, Schema} from "mongoose";

export interface IPurchase extends Document {
  supplier: Schema.Types.ObjectId;
  purchaseItems: {
    _id: Schema.Types.ObjectId;
    title: string;
    price: number;
    category: string;
    count: number;
  }[];
  orderNumber: string;
  itemsPrice: number;
}

const purchaseSchema: Schema<IPurchase> = new Schema({
  supplier: {
    type: Schema.Types.ObjectId,
    ref: "Supplier"
  },
  purchaseItems: [
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
}, {
  timestamps: true
})


export default mongoose.model("Purchase", purchaseSchema);