import { Schema, models, model } from "mongoose";

const UserConnectionSchema = new Schema({
    target: { type: Schema.Types.ObjectId, ref: "users", autopopulate: true },
    userId: { type: Schema.Types.ObjectId, ref: "users", autopopulate: true },
    status:{type:String, enum:["Follow","Reqested","Following"], default:"Follow"}
})

UserConnectionSchema.plugin(require("mongoose-autopopulate"))

const UserConnection = models.userconnection || model("userconnection", UserConnectionSchema);

export default UserConnection;