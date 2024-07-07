import mongoose, {Document, Schema, Types} from "mongoose";

enum TransactionType {
  CASHDEPO = "Cash Deposit",
  CASHWITH = "Cash Withdrawal",
  BANKDEPO = "Bank Deposit",
  BANKWITH = "Bank Withdrawal",
}

export interface ITransaction extends Document {
  transactionType: TransactionType;
  amount: number;
  remarks: string;
}

const transactionSchema: Schema<ITransaction> = new Schema({
  transactionType: {
    type: String,
    required: true,
    enum: Object.values(TransactionType),
  },
  amount: {
    type: Number,
    required: true,    
  },
  remarks: {
    type: String,
  }
}, {
  timestamps: true,
});


export default mongoose.model("Transaction", transactionSchema);