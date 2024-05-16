"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../database/database");
const company_1 = __importDefault(require("../modals/company"));
const job_1 = __importDefault(require("../modals/job"));
const key = "jobduniya";
const authentication_1 = require("../middlewares/authentication");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const companyconnection_1 = __importDefault(require("../modals/companyconnection"));
const crypto = require("crypto");
const encrypt = require("encrypt");
const companyRoute = (0, express_1.Router)();
function generateOTP(length = 6) {
    const buffer = crypto.randomBytes(Math.ceil(length / 2));
    const OTP = buffer.toString("hex").slice(0, length);
    return OTP;
}
const companyExistsEmail = (input) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.ConnectDB)();
    let companyExists = false;
    const email = yield company_1.default.findOne({ email: input });
    if (email !== null) {
        companyExists = true;
    }
    return companyExists;
});
// Register new company
companyRoute.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const company = req.body.company;
    company.password = yield encrypt.hash(company.password, 10);
    if (yield companyExistsEmail(company.email)) {
        res.status(411).json({
            res: "ERROR",
            msg: "Email Already Registered",
        });
    }
    else {
        try {
            yield (0, database_1.ConnectDB)();
            const newCompany = new company_1.default(company);
            newCompany.save();
            res.status(200).json({
                res: "ok",
                msg: "Company Registered Successfully",
                _id: newCompany._id
            });
        }
        catch (error) {
            res.status(411).json({
                res: "ERROR",
                msg: "Error Adding New Company",
                error: error,
            });
        }
    }
}));
// Company Login
companyRoute.get("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.body.password = yield encrypt.hash(req.body.password, 10);
        const email = req.body.email;
        yield (0, database_1.ConnectDB)();
        const company = yield company_1.default.findOne({ email: email });
        if (company) {
            const pwdMatch = yield encrypt.compare(req.body.password, company.password);
            if (pwdMatch) {
                jsonwebtoken_1.default.sign({ company }, key, { expiresIn: "1d" }, (err, token) => {
                    err ? res.send("something went wrong") :
                        res.status(200).json({
                            res: "ok",
                            msg: "Login Successfully",
                            token: token,
                            id: company._id,
                            user: company
                        });
                });
            }
            else {
                res.status(200).json({
                    res: "Error",
                    msg: "Password incorrect"
                });
            }
        }
        else {
            res.status(200).json({
                res: "Error",
                msg: "Invalid Credentials",
            });
        }
    }
    catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Something went wrong, Please check input",
            error: error,
        });
    }
}));
// existing comapny details
companyRoute.get("/getcompany/:id", authentication_1.companyAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield (0, database_1.ConnectDB)();
        const company = yield company_1.default.findOne({ _id: id });
        if (company !== null) {
            res.status(200).json({
                res: "ok",
                msg: "Company fetch successfully",
                company: company,
            });
        }
        else {
            res.status(200).json({
                res: "Error",
                msg: "Company Not Exists",
            });
        }
    }
    catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Error fetching company details",
            error: error,
        });
    }
}));
// Update exiting comapny details
companyRoute.patch("/update/:id", authentication_1.companyAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const update = req.body.update;
        const id = req.params.id;
        try {
            yield (0, database_1.ConnectDB)();
            const newUpdate = yield company_1.default.findOneAndUpdate({ _id: id }, { $set: update }, { new: true });
            if (newUpdate) {
                res.status(200).json({
                    res: "ok",
                    msg: "Updated data successfully",
                    update: newUpdate
                });
            }
            else {
                res.status(404).json({
                    res: "ok",
                    msg: "No data found to be updated"
                });
            }
        }
        catch (error) {
            res.status(411).json({
                res: "Error",
                msg: "Error While Updating Company Profile",
                error: error,
            });
        }
    }
    catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Invalid Input Types",
            type: {
                update: {
                    field: "value",
                },
            },
            error: error,
        });
    }
}));
// Delete Company Profile
companyRoute.delete("/delete/:id", authentication_1.companyAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield (0, database_1.ConnectDB)();
        yield company_1.default.findOneAndDelete({ _id: id });
        res.status(411).json({
            res: "ok",
            msg: "Profile Deleted Successfully",
        });
    }
    catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Invalid Input Types",
            error: error,
        });
    }
}));
// Create New Job Posting
companyRoute.post("/jobpost", authentication_1.companyAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const job = req.body.job;
    try {
        yield (0, database_1.ConnectDB)();
        const newJob = new job_1.default(job);
        newJob.save();
        res.status(200).json({
            res: "ok",
            msg: "Jobs Inserted Successfully",
        });
    }
    catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Invalid Input Types",
            error: error,
        });
    }
}));
// Connect Comapny
companyRoute.patch("/connect", authentication_1.companyAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const connectData = req.body.connectData;
    try {
        yield (0, database_1.ConnectDB)();
        const follow = new companyconnection_1.default(connectData);
        follow.save();
        res.status(200).json({
            res: "ok",
            msg: "Connect the Company Successfully",
        });
    }
    catch (error) {
        res.status(411).json({
            res: "ERROR",
            msg: "Error Adding Connect Company",
            error: error,
        });
    }
}));
// Fetch Connected Company
companyRoute.patch("/fetchconnectcompany/:id/:status", authentication_1.companyAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const status = req.params.status;
        const id = req.params.id;
        yield (0, database_1.ConnectDB)();
        const company = yield companyconnection_1.default.find({ userId: id, status: status });
        if (company !== null) {
            res.status(200).json({
                res: "ok",
                msg: "Connect Company Fetch successfully",
                company: company,
            });
        }
        else {
            res.status(200).json({
                res: "Error",
                msg: "You didn't connect anyone",
            });
        }
    }
    catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Error Fetching  Connect Company.",
            error: error,
        });
    }
}));
exports.default = companyRoute;
