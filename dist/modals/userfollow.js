"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userFollowSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "users", autopopulate: false },
    targetId: { type: [mongoose_1.Schema.Types.ObjectId], ref: "users", autopopulate: true },
});
userFollowSchema.plugin(require("mongoose-autopopulate"));
const userFollow = mongoose_1.models.companies || (0, mongoose_1.model)("userFollow", userFollowSchema);
exports.default = userFollow;
