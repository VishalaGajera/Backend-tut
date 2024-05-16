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

const CompanySchema = new Schema({
    Name: { type: String, required: false },
    Address: [AddressSchema],
    Industry: { type: String },
    Email_ID: { type: String, required: false },
    Password : {type :String},
    Logo: { type: String, required: false },
    TagLine: { type: String, required: false },
    Websites: { type: [String] },
    Contact: { type: String, required: false },
    Years: { type: String, required: false },
    Project: { type: [String], require: false },
    Description: { type: String, required: false },
    secretKey: { type: String, required: false },
    OwnerDetail: {
        Name: { type: String, required: false },
        EmailID: { type: String, required: false },
        Contact: { type: String, required: false }
    },
    HRDetail: {
        Name: { type: String, required: false },
        EmailID: { type: String, required: false },
        Contact: { type: String, required: false }
    }
});

CompanySchema.plugin(require("mongoose-autopopulate"));

const Companys = models.companies || model("companies", CompanySchema);

export default Companys;