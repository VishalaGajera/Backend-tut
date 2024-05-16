import { Schema, models, model } from "mongoose";

const SavedJobSchema = new Schema({
    Status: { type: Boolean },
    jobId: { type: Schema.Types.ObjectId, ref: "jobs", autopopulate: true },
    userId: { type: Schema.Types.ObjectId, ref: "users", autopopulate: true }
})

SavedJobSchema.plugin(require("mongoose-autopopulate"))

const SavedJob = models.savedjobs || model("savedjobs", SavedJobSchema);

export default SavedJob;