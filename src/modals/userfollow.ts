import { Schema, models, model } from "mongoose";

const userFollowSchema = new Schema({
    userId : { type: Schema.Types.ObjectId, ref: "users", autopopulate: false },
    targetId : { type: [Schema.Types.ObjectId], ref: "users", autopopulate: true },
})

userFollowSchema.plugin(require("mongoose-autopopulate"));

const userFollow = models.companies || model("userFollow", userFollowSchema);

export default userFollow;