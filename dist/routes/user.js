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
const key = "jobduniya";
const database_1 = require("../database/database");
const user_1 = __importDefault(require("../modals/user"));
const savedjob_1 = __importDefault(require("../modals/savedjob"));
const job_1 = __importDefault(require("../modals/job"));
const userfollow_1 = __importDefault(require("../modals/userfollow"));
const companyconnection_1 = __importDefault(require("../modals/companyconnection"));
const authentication_1 = require("../middlewares/authentication");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto = require("crypto");
const mongoose = require("mongoose");
const userconnection_1 = __importDefault(require("../modals/userconnection"));
const company_1 = __importDefault(require("../modals/company"));
const encrypt = require("encrypt");
const userRoute = (0, express_1.Router)();
function generateOTP(length = 6) {
    const buffer = crypto.randomBytes(Math.ceil(length / 2));
    const OTP = buffer.toString("hex").slice(0, length);
    return OTP;
}
//Checking weather provided email already exists or not
const userExistsEmail = (input) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.ConnectDB)();
    let userExists = false;
    const email = yield user_1.default.findOne({ email: input });
    if (email !== null) {
        userExists = true;
    }
    return userExists;
});
// Register new user
userRoute.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body.user;
    user.password = yield encrypt.hash(user.password, 10);
    if (yield userExistsEmail(user.email)) {
        res.status(411).json({
            res: "ERROR",
            msg: "Email Already Registered",
        });
    }
    else {
        try {
            yield (0, database_1.ConnectDB)();
            const newUser = new user_1.default(user);
            newUser.save();
            res.status(200).json({
                res: "ok",
                msg: "User Registered Successfully",
                _id: newUser._id
            });
        }
        catch (error) {
            res.status(411).json({
                res: "ERROR",
                msg: "Error Adding New User",
                error: error,
            });
        }
    }
}));
// User Login
userRoute.get("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.body.password = yield encrypt.hash(req.body.password, 10);
        const email = req.body.email;
        yield (0, database_1.ConnectDB)();
        const user = yield user_1.default.findOne({ email: email });
        if (user) {
            const pwdMatch = yield encrypt.compare(req.body.password, user.password);
            if (pwdMatch) {
                jsonwebtoken_1.default.sign({ user }, key, { expiresIn: "1d" }, (err, token) => {
                    err ? res.send("something went wrong") :
                        res.status(200).json({
                            res: "ok",
                            msg: "Login Successfully",
                            token: token,
                            id: user._id,
                            user: user
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
// existing user details
userRoute.get("/fetchUser/:id", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield (0, database_1.ConnectDB)();
        const user = yield user_1.default.findOne({ _id: id });
        if (user !== null) {
            res.status(200).json({
                res: "ok",
                msg: "User fetch successfully",
                user: user,
            });
        }
        else {
            res.status(200).json({
                res: "Error",
                msg: "User Not Exists",
            });
        }
    }
    catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Error fetching user details",
            error: error,
        });
    }
}));
// Update exiting user details
userRoute.patch("/update/:id", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const update = req.body.update;
        const id = req.params.id;
        try {
            yield (0, database_1.ConnectDB)();
            const newUpdate = yield user_1.default.findOneAndUpdate({ _id: id }, { $set: update }, { new: true });
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
                msg: "Error While Updating User Profile",
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
// delete user profile
userRoute.delete("/delete/:id", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield (0, database_1.ConnectDB)();
        yield user_1.default.findOneAndDelete({ _id: id });
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
// Fetch User Where City and State are Same to the Login User
userRoute.get("/getUser", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.userId;
    const city = req.query.city;
    const state = req.query.state;
    try {
        yield (0, database_1.ConnectDB)();
        const users = yield user_1.default.find({
            _id: { $ne: userId },
            $or: [
                { "location.city": city },
                { "location.state": state }
            ]
        });
        if (users.length > 0) {
            res.status(200).json({
                res: "ok",
                msg: "Fetch User Successfully",
                user: users
            });
        }
        else {
            res.status(411).json({
                res: "Error",
                msg: "Users Not Found"
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
// saved job
userRoute.post("/savedjob", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const UserID = req.body.userId;
    const JobID = req.body.jobId;
    if (!UserID || !JobID) {
        return res.status(400).send("User Id and Job Id are not provided");
    }
    else {
        try {
            yield (0, database_1.ConnectDB)();
            const savedjob = new savedjob_1.default(req.body);
            savedjob.save();
            res.status(200).json({
                res: "ok",
                msg: "Job Saved Successfully",
            });
        }
        catch (error) {
            res.status(411).json({
                res: "ERROR",
                msg: "Error Adding Saved Job",
                error: error,
            });
        }
    }
}));
//deleted saved job
userRoute.delete("/deletesavedjob/:id", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield (0, database_1.ConnectDB)();
        yield savedjob_1.default.findOneAndDelete({ _id: id });
        res.status(411).json({
            res: "ok",
            msg: "Saved Job Deleted Successfully",
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
// List Saved Jobs
userRoute.get("/listsavedjob/:id/:status", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const status = req.params.status;
        yield (0, database_1.ConnectDB)();
        const jobs = yield savedjob_1.default.findOne({ "userId": id, "Status": status });
        if (jobs !== null) {
            res.status(200).json({
                res: "ok",
                msg: "Saved Jobs fetch successfully",
                jobs: jobs,
            });
        }
        else {
            res.status(200).json({
                res: "Error",
                msg: "Jobs are not Saved",
            });
        }
    }
    catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Error fetching saved job details",
            error: error,
        });
    }
}));
// follow User
userRoute.patch("/follow", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const followData = req.body.followData;
    try {
        yield (0, database_1.ConnectDB)();
        const follow = new userconnection_1.default(followData);
        follow.save();
        res.status(200).json({
            res: "ok",
            msg: "Follow the User Successfully",
        });
    }
    catch (error) {
        res.status(411).json({
            res: "ERROR",
            msg: "Error Adding Follow User",
            error: error,
        });
    }
}));
// Update follow status
userRoute.patch("/following/:id", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        try {
            yield (0, database_1.ConnectDB)();
            const newUpdate = yield userconnection_1.default.findOneAndUpdate({ _id: id }, { Status: "Following" });
            res.status(200).json({
                res: "ok",
                update: newUpdate,
            });
        }
        catch (error) {
            res.status(411).json({
                res: "Error",
                msg: "Error While Updating Follow Status",
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
// Fetch follow User
userRoute.patch("/fetchfollowuser/:id/:status", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const status = req.params.status;
        const id = req.params.id;
        yield (0, database_1.ConnectDB)();
        const user = yield userconnection_1.default.find({ userId: id, status: status });
        if (user !== null) {
            res.status(200).json({
                res: "ok",
                msg: "Follow Users Fetch successfully",
                user: user,
            });
        }
        else {
            res.status(200).json({
                res: "Error",
                msg: "You didn't follow anyone",
            });
        }
    }
    catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Error Fetching  Follow Users.",
            error: error,
        });
    }
}));
// Search The Job
userRoute.get("/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tablename = req.query.tbl;
        if (!tablename) {
            return res.status(400).send("Table name not provided");
        }
        const Model = mongoose.model(tablename);
        if (!Model) {
            return res.status(404).send("Model not found");
        }
        const keyword = req.query.keyword;
        const location = req.query.location;
        const query = {}; // Explicitly typing query
        if (keyword) {
            query.Title = { $regex: keyword, $options: "i" };
        }
        if (location) {
            const locationString = location.toString(); // Ensure location is string
            const locationRegex = new RegExp(locationString.replace(/ /g, "|"), "i");
            query["$or"] = [
                { "company.Address.city": { $regex: locationRegex } },
                { "company.Address.state": { $regex: locationRegex } },
                { "company.Address.location": { $regex: locationRegex } } // Include 'location' field if you have one
            ];
        }
        if (tablename === "jobs") {
            const jobs = yield Model.aggregate([
                {
                    $lookup: {
                        from: 'companies',
                        localField: 'company',
                        foreignField: '_id',
                        as: 'company'
                    }
                },
                {
                    $match: query
                }
            ]);
            res.json(jobs);
        }
        else {
            const schema = Model.schema.paths;
            const orQuery = Object.keys(schema)
                .filter((key) => schema[key].instance === "String")
                .map((key) => ({
                [key]: { $regex: new RegExp(keyword || "", "i") },
            }));
            if (orQuery.length === 0) {
                return res
                    .status(400)
                    .send("No searchable string fields in the schema");
            }
            const list = yield Model.find({ $or: orQuery });
            res.send(list);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}));
// Fetch Jobs
userRoute.get('/jobs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, id } = req.query;
        let query = {};
        if (title) {
            // query.Title = { $regex: title, $options: 'i' };
        }
        if (id) {
            // query._id = id;
        }
        const jobs = yield job_1.default.find(query);
        // res.json(jobs);
        res.status(200).json({
            res: "ok",
            jobs: jobs
        });
    }
    catch (err) {
        console.error(err);
        // res.status(500).json({ error: 'Server Error' });
        res.status(500).json({
            res: "Error",
            msg: "Server Error"
        });
    }
}));
// User Who Perform Follow
userRoute.post("/userWhoPerformFollow", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.userId;
    if (!id) {
        return res.status(400).send("User Id and Job Id are not provided");
    }
    else {
        const finaldata = new userfollow_1.default(req.body);
        userfollow_1.default.insertMany(finaldata)
            .then((e) => {
            res.status(201).json({
                res: "ok",
                msg: "Follow the User Successfully",
                data: e
            });
        })
            .catch((e) => {
            res.status(400).json({
                res: "Error",
                msg: "Not Follow The User",
                Error: e
            });
        });
    }
}));
// User Who Perform Follow Ti Company
userRoute.post("/userWhoPerformFollowToCompany", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.userId;
    if (!id) {
        return res.status(400).send("User Id and Job Id are not provided");
    }
    else {
        const finaldata = new companyconnection_1.default(req.body);
        companyconnection_1.default.insertMany(finaldata)
            .then((e) => {
            res.status(201).json({
                res: "ok",
                msg: "Connect the Company Successfully",
                data: e
            });
        })
            .catch((e) => {
            res.status(400).json({
                res: "Error",
                msg: "Not Connect The Company",
                Error: e
            });
        });
    }
}));
// Fetch Followers
userRoute.get("/myFollowers/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const users = yield userfollow_1.default.find({ "userId": id });
        console.log(users);
        if (users) {
            res.status(201).json({
                res: "ok",
                users: users
            });
        }
        else {
            res.status(404).json({
                res: "Error",
                message: "No Users Found"
            });
        }
    }
    catch (e) {
        res.status(500).json({
            res: "Error",
            Error: e
        });
    }
}));
// Fetch Not Followed User
userRoute.get("/notFollowed/:userId/:limit", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, limit } = req.params; // Assuming you have authenticated the user and have access to user's ID
        const limitNumber = parseInt(limit, 10);
        // Find all users who are not followed by the current user
        const usersNotFollowed = yield userfollow_1.default.findOne({ userId: userId });
        if (usersNotFollowed) {
            const users = yield user_1.default.find({
                $and: [
                    { _id: { $ne: userId } },
                    { _id: { $nin: usersNotFollowed.targetId } }
                ]
            }).limit(limitNumber);
            res.status(201).json({
                res: "ok",
                users: users
            });
        }
        else {
            res.status(400).json({
                res: "Error",
                message: "user not found"
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            res: "Error",
            message: "Server Error"
        });
    }
}));
// Fetch Not Followed Company
userRoute.get("/notFollowedCompany/:userId/:limit", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, limit } = req.params;
        const limitNumber = parseInt(limit, 10);
        const usersNotFollowed = yield companyconnection_1.default.findOne({ userId: userId });
        if (usersNotFollowed) {
            const users = yield company_1.default.find({
                $and: [
                    { _id: { $ne: userId } },
                    { _id: { $nin: usersNotFollowed.targetId } }
                ]
            }).limit(limitNumber);
            res.status(201).json({
                res: "ok",
                users: users
            });
        }
        else {
            res.status(404).json({
                res: "Error",
                message: "user not found"
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            res: "Error",
            message: "Server Error"
        });
    }
}));
// Fetch Followings
userRoute.get("/getFollowings/:id", authentication_1.userAuthentication, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userfollow_1.default.find({ userId: req.params.id });
        if (users.length !== 0) {
            res.status(201).json({
                res: "ok",
                users: users
            });
        }
        else {
            res.status(404).json({
                res: "Error",
                message: "Users not found"
            });
        }
    }
    catch (e) {
        res.status(500).json({ res: "Error", e });
    }
}));
exports.default = userRoute;
