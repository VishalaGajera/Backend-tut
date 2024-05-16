"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AdminSchema = new mongoose_1.Schema({
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
AdminSchema.plugin(require("mongoose-autopopulate"));
const Admin = mongoose_1.models.admins || (0, mongoose_1.model)("admins", AdminSchema);
exports.default = Admin;
