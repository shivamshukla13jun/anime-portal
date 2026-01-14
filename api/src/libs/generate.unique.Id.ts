import mongoose from "mongoose";
export type PrefixType = 'BAL-' | 'BILL-' | 'CUSTOMER-' | 'INVOICE-' | 'PL-' | 'PS-' | 'VENDOR-' | 'CARRIER-' | 'UNKNOWN-' 
const CounterSchema = new mongoose.Schema({
    prefix: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 }
  },{
    collection:"counters"
  });
  const Counter = mongoose.model("counters", CounterSchema);
  
  // generator function
  async function generateUniqueId(prefix: PrefixType,session?:mongoose.ClientSession): Promise<string> {
    const counter=session?await Counter.findOneAndUpdate(
      { prefix },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    ).session(session):await Counter.findOneAndUpdate(
      { prefix },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return `${prefix}${counter.seq}`;
  }
  export {generateUniqueId}
  