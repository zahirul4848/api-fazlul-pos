import mongoose, {Document, Schema} from "mongoose";

export interface ICounter extends Document {
  seq: number;
}

const counterForPurchaseSchema = new Schema<ICounter>({
  //_id: {type: Schema.Types.ObjectId, required: true},
  seq: { type: Number, default: 0 }
});


export default mongoose.model('Counterforpurchase', counterForPurchaseSchema);