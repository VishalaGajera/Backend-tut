import { Schema, models, model } from "mongoose";

const AddressSchema = new Schema({
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

const EducationSchema = new Schema({
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

const WorkExperienceSchema = new Schema({
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

const UserSchema = new Schema({
    privat : {
        type :Boolean
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

AddressSchema.plugin(require("mongoose-autopopulate"))
EducationSchema.plugin(require("mongoose-autopopulate"))
WorkExperienceSchema.plugin(require("mongoose-autopopulate"))
UserSchema.plugin(require("mongoose-autopopulate"));

const Users = models.users || model("users", UserSchema);

export default Users;