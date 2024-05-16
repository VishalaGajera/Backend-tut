import { Schema, models, model } from "mongoose";

const JobSchema = new Schema({
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
    company: { type: Schema.Types.ObjectId, ref: "companies", autopopulate: true }
});

JobSchema.plugin(require("mongoose-autopopulate"));

const Job = models.jobs || model("jobs", JobSchema);

export default Job;