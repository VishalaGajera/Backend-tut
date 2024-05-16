"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const JobApplicationsSchema = new mongoose_1.Schema({
    cv: { type: String },
    companyId: { type: mongoose_1.Schema.Types.ObjectId, ref: "companies", autopopulate: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "users", autopopulate: true },
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: "jobs", autopopulate: true }
});
JobApplicationsSchema.plugin(require("mongoose-autopopulate"));
const JobApplication = mongoose_1.models.jobapplications || (0, mongoose_1.model)("jobapplications", JobApplicationsSchema);
exports.default = JobApplication;
