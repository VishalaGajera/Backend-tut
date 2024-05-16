"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CompanyConnectionSchema = new mongoose_1.Schema({
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: "companies", autopopulate: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "users", autopopulate: true },
    status: { type: String, enum: ["Connect", "Connected"], default: "Connect" }
});
CompanyConnectionSchema.plugin(require("mongoose-autopopulate"));
const CompanyConnection = mongoose_1.models.comapnyconnection || (0, mongoose_1.model)("comapnyconnection", CompanyConnectionSchema);
exports.default = CompanyConnection;
