"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserConnectionSchema = new mongoose_1.Schema({
    target: { type: mongoose_1.Schema.Types.ObjectId, ref: "users", autopopulate: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "users", autopopulate: true },
    status: { type: String, enum: ["Follow", "Reqested", "Following"], default: "Follow" }
});
UserConnectionSchema.plugin(require("mongoose-autopopulate"));
const UserConnection = mongoose_1.models.userconnection || (0, mongoose_1.model)("userconnection", UserConnectionSchema);
exports.default = UserConnection;
