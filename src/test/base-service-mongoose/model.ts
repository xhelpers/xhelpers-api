import * as mongoose from "mongoose";
import * as mongooseLeanVirtuals from "mongoose-lean-virtuals";

export interface ITodo extends mongoose.Document {
  task: string;
  description: string;
  done: boolean;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  taskUpperCase: string;
}

const schema = new mongoose.Schema({
  task: { type: String , required: true },
  description: { type: String , required: true },
  done: { type: Boolean, required: false, default: false },
  createdAt: { type: Date, required: false, default: new Date() },
  createdBy: { type: String , required: false },
  updatedAt: { type: Date, required: false },
  updatedBy: { type: String , required: false },
});

schema.virtual("taskUpperCase").get(function (this: ITodo) {
  if (!this.task) return undefined;
  return this.task.toUpperCase();
});

schema.set("toJSON", { virtuals: true });
schema.plugin(mongooseLeanVirtuals);

export default mongoose.model<ITodo>("Todo", schema, "todo");
