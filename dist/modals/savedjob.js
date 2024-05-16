"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SavedJobSchema = new mongoose_1.Schema({
    Status: { type: Boolean },
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: "jobs", autopopulate: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "users", autopopulate: true }
});
SavedJobSchema.plugin(require("mongoose-autopopulate"));
const SavedJob = mongoose_1.models.savedjobs || (0, mongoose_1.model)("savedjobs", SavedJobSchema);
exports.default = SavedJob;
