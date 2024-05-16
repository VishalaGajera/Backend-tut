import { Router } from "express";
import { ConnectDB } from "../database/database";
import Companys from "../modals/company";
import CompanyConnection from "../modals/companyconnection";
import Job from "../modals/job";
const key = "jobduniya";
import { companyAuthentication } from "../middlewares/authentication";
import jwt from "jsonwebtoken";
import { jwtpassword } from "../config";
import { sendMail } from "../middlewares/mailservices";
import ComapnyConnection from "../modals/companyconnection";
const crypto = require("crypto");
const encrypt = require("encrypt");

const companyRoute = Router();

function generateOTP(length = 6) {
    const buffer = crypto.randomBytes(Math.ceil(length / 2));
    const OTP = buffer.toString("hex").slice(0, length);
    return OTP;
}

const companyExistsEmail = async (input: string) => {
    await ConnectDB();
    let companyExists = false;
    const email = await Companys.findOne({ email: input });
    if (email !== null) {
        companyExists = true;
    }
    return companyExists;
};

// Register new company
companyRoute.post("/signup", async (req, res) => {
    const company = req.body.company;
    company.password = await encrypt.hash(company.password, 10);
    if (await companyExistsEmail(company.email)) {
        res.status(411).json({
            res: "ERROR",
            msg: "Email Already Registered",
        });
    } else {
        try {
            await ConnectDB();
            const newCompany = new Companys(company);
            newCompany.save();
            res.status(200).json({
                res: "ok",
                msg: "Company Registered Successfully",
                _id: newCompany._id
            });
        } catch (error) {
            res.status(411).json({
                res: "ERROR",
                msg: "Error Adding New Company",
                error: error,
            });
        }
    }
});

// Company Login
companyRoute.get("/signin", async (req, res) => {
    try {
        req.body.password = await encrypt.hash(req.body.password, 10);
        const email = req.body.email;
        await ConnectDB();
        const company = await Companys.findOne({ email: email });
        if (company) {
            const pwdMatch = await encrypt.compare(req.body.password, company.password);
            if (pwdMatch) {
                jwt.sign({ company }, key, { expiresIn: "1d" }, (err, token) => {
                    err ? res.send("something went wrong") :
                        res.status(200).json({
                            res: "ok",
                            msg: "Login Successfully",
                            token: token,
                            id: company._id,
                            user: company
                        })
                })
            }
            else {
                res.status(200).json({
                    res: "Error",
                    msg: "Password incorrect"
                })
            }
        } else {
            res.status(200).json({
                res: "Error",
                msg: "Invalid Credentials",
            });
        }
    } catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Something went wrong, Please check input",
            error: error,
        });
    }
});

// existing comapny details
companyRoute.get("/getcompany/:id", companyAuthentication, async (req: any, res) => {
    try {
        const id = req.params.id;
        await ConnectDB();
        const company = await Companys.findOne({ _id: id });
        if (company !== null) {
            res.status(200).json({
                res: "ok",
                msg: "Company fetch successfully",
                company: company,
            });
        } else {
            res.status(200).json({
                res: "Error",
                msg: "Company Not Exists",
            });
        }
    } catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Error fetching company details",
            error: error,
        });
    }
});

// Update exiting comapny details
companyRoute.patch("/update/:id", companyAuthentication, async (req: any, res) => {
    try {
        const update = req.body.update;
        const id = req.params.id;
        try {
            await ConnectDB();
            const newUpdate = await Companys.findOneAndUpdate(
                { _id: id },
                { $set: update },
                { new: true });
            if (newUpdate) {
                res.status(200).json({
                    res: "ok",
                    msg: "Updated data successfully",
                    update: newUpdate
                });
            } else {
                res.status(404).json({
                    res: "ok",
                    msg: "No data found to be updated"
                })
            }
        } catch (error) {
            res.status(411).json({
                res: "Error",
                msg: "Error While Updating Company Profile",
                error: error,
            });
        }
    } catch (error) {
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
});

// Delete Company Profile
companyRoute.delete("/delete/:id", companyAuthentication, async (req: any, res) => {
    try {
        const id = req.params.id;
        await ConnectDB();
        await Companys.findOneAndDelete({ _id: id });
        res.status(411).json({
            res: "ok",
            msg: "Profile Deleted Successfully",
        });
    } catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Invalid Input Types",
            error: error,
        });
    }
});

// Create New Job Posting
companyRoute.post("/jobpost", companyAuthentication, async (req: any, res) => {
    const job = req.body.job;
    try {
        await ConnectDB();
        const newJob = new Job(job);
        newJob.save();
        res.status(200).json({
            res: "ok",
            msg: "Jobs Inserted Successfully",
        });
    } catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Invalid Input Types",
            error: error,
        });
    }
});

// Connect Comapny
companyRoute.patch("/connect", companyAuthentication, async (req: any, res) => {
    const connectData = req.body.connectData;
    try {
        await ConnectDB();
        const follow = new ComapnyConnection(connectData);
        follow.save();
        res.status(200).json({
            res: "ok",
            msg: "Connect the Company Successfully",
        });
    } catch (error) {
        res.status(411).json({
            res: "ERROR",
            msg: "Error Adding Connect Company",
            error: error,
        });
    }
});

// Fetch Connected Company
companyRoute.patch("/fetchconnectcompany/:id/:status", companyAuthentication, async (req: any, res) => {
    try {
        const status = req.params.status;
        const id = req.params.id;
        await ConnectDB();
        const company = await ComapnyConnection.find({ userId: id, status: status });
        if (company !== null) {
            res.status(200).json({
                res: "ok",
                msg: "Connect Company Fetch successfully",
                company: company,
            });
        } else {
            res.status(200).json({
                res: "Error",
                msg: "You didn't connect anyone",
            });
        }
    } catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Error Fetching  Connect Company.",
            error: error,
        });
    }
});

export default companyRoute;