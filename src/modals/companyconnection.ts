import { Schema, models, model } from "mongoose";

const CompanyConnectionSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: "companies", autopopulate: true },
    userId: { type: Schema.Types.ObjectId, ref: "users", autopopulate: true },
    status: { type: String, enum: ["Connect", "Connected"], default: "Connect" }
})

CompanyConnectionSchema.plugin(require("mongoose-autopopulate"))

const CompanyConnection = models.comapnyconnection || model("comapnyconnection", CompanyConnectionSchema);

export default CompanyConnection;