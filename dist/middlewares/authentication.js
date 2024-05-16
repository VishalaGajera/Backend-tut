"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyAuthentication = exports.userAuthentication = void 0;
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userAuthentication = (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        const token = auth.split(" ")[1];
        try {
            if (token) {
                const verify = jsonwebtoken_1.default.verify(token, config_1.jwtpassword);
                if (verify.status === "user") {
                    req.email = verify.email;
                    next();
                }
                else {
                    res.status(200).json({
                        res: "Error",
                        msg: "Invalid Credentials for user",
                    });
                }
            }
            else {
                res.status(200).json({
                    res: "Error",
                    msg: "Invalid auth token",
                });
            }
        }
        catch (error) {
            res.status(411).json({
                res: "Error",
                msg: "Error varifying auth token" + token,
                error: error,
            });
        }
    }
    catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Invalid Auth Token" + error,
        });
    }
};
exports.userAuthentication = userAuthentication;
const companyAuthentication = (req, res, next) => {
    try {
        const auth = req.headers.authorization;
        const token = auth.split(" ")[1];
        try {
            if (token) {
                const verify = jsonwebtoken_1.default.verify(token, config_1.jwtpassword);
                if (verify.status === "company") {
                    req.email = verify.email;
                    next();
                }
                else {
                    res.status(200).json({
                        res: "Error",
                        msg: "Invalid Credentials for company",
                    });
                }
            }
            else {
                res.status(200).json({
                    res: "Error",
                    msg: "Invalid auth token",
                });
            }
        }
        catch (error) {
            res.status(411).json({
                res: "Error",
                msg: "Error varifying auth token" + token,
                error: error
            });
        }
    }
    catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Invalid Auth Token" + error,
            error: error
        });
    }
};
exports.companyAuthentication = companyAuthentication;
