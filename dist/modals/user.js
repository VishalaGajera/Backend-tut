"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AddressSchema = new mongoose_1.Schema({
    personalAddress: {
        type: String,
        required: false
    },
    pinCode: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
});
const EducationSchema = new mongoose_1.Schema({
    univercity: {
        type: String
    },
    school: {
        type: String
    },
    institutionName: {
        type: String,
        required: false
    },
    degreeLevel: {
        type: String,
        required: false
    },
    startDateSchool: {
        type: Date,
        required: false
    },
    endDateSchool: {
        type: Date,
        required: false
    },
    gpa: {
        type: Number,
        required: false
    },
    certifications: [{
            type: String,
            required: false
        }],
    onlineCourses: [{
            type: String,
            required: false
        }],
});
const WorkExperienceSchema = new mongoose_1.Schema({
    userType: {
        type: String,
        required: false
    },
    jobTitle: {
        type: String,
    },
    companyName: {
        type: String,
    },
    startDateWork: {
        type: Date
    },
    endDateWork: {
        type: Date
    },
    responsibilities: {
        type: String
    },
    achievements: [{ type: String, required: false }],
});
const UserSchema = new mongoose_1.Schema({
    privat: {
        type: Boolean
    },
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
    },
    registrationDate: {
        type: Date,
        default: Date.now,
    },
    langauges: {
        type: [String],
    },
    cv: {
        type: String
    },
    skills: {
        type: [String],
    },
    profession: {
        type: String,
    },
    secretKey: {
        type: String
    },
    location: [AddressSchema],
    education: [EducationSchema],
    experience: [WorkExperienceSchema]
});
AddressSchema.plugin(require("mongoose-autopopulate"));
EducationSchema.plugin(require("mongoose-autopopulate"));
WorkExperienceSchema.plugin(require("mongoose-autopopulate"));
UserSchema.plugin(require("mongoose-autopopulate"));
const Users = mongoose_1.models.users || (0, mongoose_1.model)("users", UserSchema);
exports.default = Users;
