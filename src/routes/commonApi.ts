import { Router } from "express";
const key = "jobduniya";
import { ConnectDB } from "../database/database";
import Users from "../modals/user";
import Companys from "../modals/company";
import SavedJob from "../modals/savedjob";
import Job from "../modals/job";
import JobApplication from "../modals/jobapplication";
import UserConnection from "../modals/userconnection";
import ComapnyConnection from "../modals/companyconnection";
import userFollow from "../modals/userfollow";
import { userAuthentication } from "../middlewares/authentication";
import jwt from "jsonwebtoken";
import { jwtpassword } from "../config";
const crypto = require("crypto");
const mongoose = require("mongoose");
import { sendMail } from "../middlewares/mailservices";
const encrypt = require("encrypt");

const apiRoute = Router();

function generateOTP(length = 6) {
    const buffer = crypto.randomBytes(Math.ceil(length / 2));
    const OTP = buffer.toString("hex").slice(0, length);
    return OTP;
}

// Update Details
apiRoute.patch("/updateDetails", async (req, res) => {
    try {
        const tablename = req.body.COLLECTION_NAME;
        // console.log(req.body);
        if (!tablename) {
            res.status(400).json({
                res: "Error",
                msg: "Table name not provided"
            });
        }
        const Model = mongoose.model(tablename);
        if (!Model) {
            res.status(404).json({
                res: "Error",
                msg: "Model not found"
            });
        }
        const { _id, COLUMNS } = req.body;

        if (!_id) {
            res.status(400).json({
                res: "Error",
                msg: "Document ID not provided"
            });
        }

        if (tablename !== "userFollow") {
            await ConnectDB();
            const updatedDocument = await Model.findByIdAndUpdate(
                _id,
                { $set: COLUMNS },
                { new: true }
            );
            if (updatedDocument) {
                console.log(updatedDocument);
                return res.send({
                    success: true,
                    message: "Updated data successfully",
                    updatedDocument,
                });
            } else {
                res.status(404).json({
                    res: "Error",
                    msg: "Document not found"
                });
            }
        }
        else {
            await ConnectDB();
            const updatedDocument = await Model.findOneAndUpdate(
                _id,
                { $addToSet: { targetId: COLUMNS.targetId } },
                { new: true }
            );
            if (updatedDocument) {
                console.log(updatedDocument);
                return res.send({
                    success: true,
                    message: "Updated data successfully",
                    updatedDocument,
                });
            } else {
                res.status(404).json({
                    res: "Error",
                    msg: "Document not found"
                });
            }
        }
    } catch (error) {
        // console.error("Error updating document:", error);
        res.status(500).json({
            res: "Error",
            msg: "Internal Server Error",
            error: error
        });
    }
});

// Fetch Data
apiRoute.get("/fetchall/:tbl/:limit/:skip", async (req, res) => {
    const tablename = req.params.tbl;
    if (!tablename) {
        return res.status(400).json({
            res: "Error",
            msg: "Table name not provided"
        });
    }
    const Model = mongoose.model(tablename);
    if (!Model) {
        return res.status(404).json({
            res: "Error",
            msg: "Model not found"
        });
    } else {
        await ConnectDB();
        const list = await Model.find(req.body.where)
            .limit(req.params.limit)
            .skip(req.params.skip);
        res.status(201).json({
            res: "ok",
            msg: "Data are Found",
            data: list
        });
    }
});

// Forgot Password
apiRoute.patch("/forgot/:tbl", async (req: any, res) => {
    try {
        const oneTimeOTP = generateOTP();
        const to = req.body.email;
        const tablename = req.params.tbl;
        if (!tablename) {
            return res.status(400).json({
                res: "Error",
                msg: "Table name not provided"
            });
        }
        const Model = mongoose.model(tablename);
        if (!Model) {
            return res.status(404).json({
                res: "Error",
                msg: "Model not found"
            });
        } else {
            try {
                await ConnectDB();
                const user = await Model.findOneAndUpdate({ email: req.body.email }, { secretKey: oneTimeOTP });
                const subject = " Password Reset Verification Code";
                const html =
                    "<p>dear ,</p>" + req.body.email +
                    "<p>You have requested to change password of your account. Please use the following One-Time Password (OTP) to proceed:</p><p>OTP: <b>" +
                    oneTimeOTP +
                    "</b><p>This OTP is valid for a limited time only. Do not share this OTP with anyone for security reasons.</p>" +
                    "<p><b>Thank you for choosing JobDuniya!,</b></p><p><b>regards ,<br/> jobDuniya & Team</b></p>";
                const result = await sendMail(to, subject, html);
                res.status(200).json({
                    res: "ok",
                    msg: "Email sent successfully",
                    result: result
                });
            } catch (error) {
                res.status(200).json({
                    res: "Error",
                    msg: "Something went wrong, Please check input",
                });
            }
        }
    } catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Invalid Input Types",
            error: error,
        });
    }
});

// check Otp
apiRoute.get("/checkOTP/:tbl", async (req: any, res) => {
    try {
        const ConOTP = req.body.otp;
        const tablename = req.params.tbl;
        if (!tablename) {
            return res.status(400).json({
                res: "Error",
                msg: "Table name not provided"
            });
        }
        const Model = mongoose.model(tablename);
        if (!Model) {
            return res.status(404).json({
                res: "Error",
                msg: "Model not found"
            });
        } else {
            await ConnectDB();
            const user = await Model.findOne({ email: req.body.email });
            if (ConOTP === user.secretKey) {
                res.status(200).json({
                    res: "ok",
                    msg: "OTP are match",
                    user: user
                });
            } else {
                res.status(411).json({
                    res: "Error",
                    msg: "Something went wrong, Please check input",
                });
            }
        }
    } catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Invalid Input Types",
            error: error,
        });
    }
});

// change Password
apiRoute.patch("/changpwd/:tbl", async (req: any, res) => {
    try {
        req.body.password = await encrypt.hash(req.body.password, 10);
        const email = req.body.email;
        const tablename = req.params.tbl;
        if (!tablename) {
            return res.status(400).json({
                res: "Error",
                msg: "Table name not provided"
            });
        }
        const Model = mongoose.model(tablename);
        if (!Model) {
            return res.status(404).json({
                res: "Error",
                msg: "Model not found"
            });
        } else {
            try {
                await ConnectDB();
                const newUpdate = await Model.findOneAndUpdate({ email: email }, { $set: [{ password: req.body.password }, { secretKey: "" }] });
                res.status(200).json({
                    res: "ok",
                    update: newUpdate,
                });
            } catch (error) {
                res.status(411).json({
                    res: "Error",
                    msg: "Error While Updating User Password",
                    error: error,
                });
            }
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

export default apiRoute;