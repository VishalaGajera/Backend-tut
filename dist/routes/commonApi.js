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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const key = "jobduniya";
const database_1 = require("../database/database");
const crypto = require("crypto");
const mongoose = require("mongoose");
const mailservices_1 = require("../middlewares/mailservices");
const encrypt = require("encrypt");
const apiRoute = (0, express_1.Router)();
function generateOTP(length = 6) {
    const buffer = crypto.randomBytes(Math.ceil(length / 2));
    const OTP = buffer.toString("hex").slice(0, length);
    return OTP;
}
// Update Details
apiRoute.patch("/updateDetails", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            yield (0, database_1.ConnectDB)();
            const updatedDocument = yield Model.findByIdAndUpdate(_id, { $set: COLUMNS }, { new: true });
            if (updatedDocument) {
                console.log(updatedDocument);
                return res.send({
                    success: true,
                    message: "Updated data successfully",
                    updatedDocument,
                });
            }
            else {
                res.status(404).json({
                    res: "Error",
                    msg: "Document not found"
                });
            }
        }
        else {
            yield (0, database_1.ConnectDB)();
            const updatedDocument = yield Model.findOneAndUpdate(_id, { $addToSet: { targetId: COLUMNS.targetId } }, { new: true });
            if (updatedDocument) {
                console.log(updatedDocument);
                return res.send({
                    success: true,
                    message: "Updated data successfully",
                    updatedDocument,
                });
            }
            else {
                res.status(404).json({
                    res: "Error",
                    msg: "Document not found"
                });
            }
        }
    }
    catch (error) {
        // console.error("Error updating document:", error);
        res.status(500).json({
            res: "Error",
            msg: "Internal Server Error",
            error: error
        });
    }
}));
// Fetch Data
apiRoute.get("/fetchall/:tbl/:limit/:skip", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    else {
        yield (0, database_1.ConnectDB)();
        const list = yield Model.find(req.body.where)
            .limit(req.params.limit)
            .skip(req.params.skip);
        res.status(201).json({
            res: "ok",
            msg: "Data are Found",
            data: list
        });
    }
}));
// Forgot Password
apiRoute.patch("/forgot/:tbl", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        else {
            try {
                yield (0, database_1.ConnectDB)();
                const user = yield Model.findOneAndUpdate({ email: req.body.email }, { secretKey: oneTimeOTP });
                const subject = " Password Reset Verification Code";
                const html = "<p>dear ,</p>" + req.body.email +
                    "<p>You have requested to change password of your account. Please use the following One-Time Password (OTP) to proceed:</p><p>OTP: <b>" +
                    oneTimeOTP +
                    "</b><p>This OTP is valid for a limited time only. Do not share this OTP with anyone for security reasons.</p>" +
                    "<p><b>Thank you for choosing JobDuniya!,</b></p><p><b>regards ,<br/> jobDuniya & Team</b></p>";
                const result = yield (0, mailservices_1.sendMail)(to, subject, html);
                res.status(200).json({
                    res: "ok",
                    msg: "Email sent successfully",
                    result: result
                });
            }
            catch (error) {
                res.status(200).json({
                    res: "Error",
                    msg: "Something went wrong, Please check input",
                });
            }
        }
    }
    catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Invalid Input Types",
            error: error,
        });
    }
}));
// check Otp
apiRoute.get("/checkOTP/:tbl", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        else {
            yield (0, database_1.ConnectDB)();
            const user = yield Model.findOne({ email: req.body.email });
            if (ConOTP === user.secretKey) {
                res.status(200).json({
                    res: "ok",
                    msg: "OTP are match",
                    user: user
                });
            }
            else {
                res.status(411).json({
                    res: "Error",
                    msg: "Something went wrong, Please check input",
                });
            }
        }
    }
    catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Invalid Input Types",
            error: error,
        });
    }
}));
// change Password
apiRoute.patch("/changpwd/:tbl", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.body.password = yield encrypt.hash(req.body.password, 10);
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
        }
        else {
            try {
                yield (0, database_1.ConnectDB)();
                const newUpdate = yield Model.findOneAndUpdate({ email: email }, { $set: [{ password: req.body.password }, { secretKey: "" }] });
                res.status(200).json({
                    res: "ok",
                    update: newUpdate,
                });
            }
            catch (error) {
                res.status(411).json({
                    res: "Error",
                    msg: "Error While Updating User Password",
                    error: error,
                });
            }
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
exports.default = apiRoute;
