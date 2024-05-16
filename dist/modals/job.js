"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const JobSchema = new mongoose_1.Schema({
    Title: { type: String, required: false },
    Position: { type: String, required: false },
    JobPostedTime: { type: String, default: Date.now, required: false },
    Description: {
        JobDescription: { type: String, required: false },
        TechnicalDescription: { type: String, required: false }
    },
    Experience: { type: String, required: false },
    JobType: { type: String, required: false },
    Salary: { type: String, required: false },
    company: { type: mongoose_1.Schema.Types.ObjectId, ref: "companies", autopopulate: true }
});
JobSchema.plugin(require("mongoose-autopopulate"));
const Job = mongoose_1.models.jobs || (0, mongoose_1.model)("jobs", JobSchema);
exports.default = Job;
