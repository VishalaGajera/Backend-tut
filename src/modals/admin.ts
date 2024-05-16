import { Schema, models, model } from "mongoose";

const AdminSchema = new Schema({
    email: {
        type: String,
    },
    password: {
        type: String
    },
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    profileImage: {
        type: String,
    }
});

AdminSchema.plugin(require("mongoose-autopopulate"))

const Admin = models.admins || model("admins", AdminSchema);

export default Admin;