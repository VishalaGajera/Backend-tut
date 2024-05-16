import { Schema, models, model } from "mongoose";

const JobApplicationsSchema = new Schema({
    cv:{type:String},
    companyId: { type: Schema.Types.ObjectId, ref: "companies", autopopulate: true },
    userId: { type: Schema.Types.ObjectId, ref: "users", autopopulate: true },
    jobId: { type: Schema.Types.ObjectId, ref: "jobs", autopopulate: true }
})

JobApplicationsSchema.plugin(require("mongoose-autopopulate"))

const JobApplication = models.jobapplications || model("jobapplications", JobApplicationsSchema);

export default JobApplication;