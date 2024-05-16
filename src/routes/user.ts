import { Router } from "express";
const key = "jobduniya";
import { ConnectDB } from "../database/database";
import Users from "../modals/user";
import SavedJob from "../modals/savedjob";
import Job from "../modals/job";
import userFollow from "../modals/userfollow";
import CompanyConnection from "../modals/companyconnection";
import { userAuthentication } from "../middlewares/authentication";
import jwt from "jsonwebtoken";
import { jwtpassword } from "../config";
const crypto = require("crypto");
const mongoose = require("mongoose");
import { sendMail } from "../middlewares/mailservices";
import UserConnection from "../modals/userconnection";
import Companys from "../modals/company";
const encrypt = require("encrypt");

const userRoute = Router();

function generateOTP(length = 6) {
    const buffer = crypto.randomBytes(Math.ceil(length / 2));
    const OTP = buffer.toString("hex").slice(0, length);
    return OTP;
}

//Checking weather provided email already exists or not
const userExistsEmail = async (input: string) => {
    await ConnectDB();
    let userExists = false;
    const email = await Users.findOne({ email: input });
    if (email !== null) {
        userExists = true;
    }
    return userExists;
};

// Register new user
userRoute.post("/signup", async (req, res) => {
    const user = req.body.user;
    user.password = await encrypt.hash(user.password, 10);
    if (await userExistsEmail(user.email)) {
        res.status(411).json({
            res: "ERROR",
            msg: "Email Already Registered",
        });
    } else {
        try {
            await ConnectDB();
            const newUser = new Users(user);
            newUser.save();
            res.status(200).json({
                res: "ok",
                msg: "User Registered Successfully",
                _id: newUser._id
            });
        } catch (error) {
            res.status(411).json({
                res: "ERROR",
                msg: "Error Adding New User",
                error: error,
            });
        }
    }
});

// User Login
userRoute.get("/signin", async (req, res) => {
    try {
        req.body.password = await encrypt.hash(req.body.password, 10);
        const email = req.body.email;
        await ConnectDB();
        const user = await Users.findOne({ email: email });
        if (user) {
            const pwdMatch = await encrypt.compare(req.body.password, user.password);
            if (pwdMatch) {
                jwt.sign({ user }, key, { expiresIn: "1d" }, (err, token) => {
                    err ? res.send("something went wrong") :
                        res.status(200).json({
                            res: "ok",
                            msg: "Login Successfully",
                            token: token,
                            id: user._id,
                            user: user
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

// existing user details
userRoute.get("/fetchUser/:id", userAuthentication, async (req: any, res) => {
    try {
        const id = req.params.id;
        await ConnectDB();
        const user = await Users.findOne({ _id: id });
        if (user !== null) {
            res.status(200).json({
                res: "ok",
                msg: "User fetch successfully",
                user: user,
            });
        } else {
            res.status(200).json({
                res: "Error",
                msg: "User Not Exists",
            });
        }
    } catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Error fetching user details",
            error: error,
        });
    }
});

// Update exiting user details
userRoute.patch("/update/:id", userAuthentication, async (req: any, res) => {
    try {
        const update = req.body.update;
        const id = req.params.id;
        try {
            await ConnectDB();
            const newUpdate = await Users.findOneAndUpdate(
                { _id: id },
                { $set: update },
                { new: true }
            );

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
                msg: "Error While Updating User Profile",
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

// delete user profile
userRoute.delete("/delete/:id", userAuthentication, async (req: any, res) => {
    try {
        const id = req.params.id;
        await ConnectDB();
        await Users.findOneAndDelete({ _id: id });
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

// Fetch User Where City and State are Same to the Login User
userRoute.get("/getUser", userAuthentication, async (req, res) => {
    const userId = req.query.userId;
    const city = req.query.city;
    const state = req.query.state;
    try {
        await ConnectDB();
        const users = await Users.find({
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
            })
        } else {
            res.status(411).json({
                res: "Error",
                msg: "Users Not Found"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// saved job
userRoute.post("/savedjob", userAuthentication, async (req, res) => {
    const UserID = req.body.userId;
    const JobID = req.body.jobId;
    if (!UserID || !JobID) {
        return res.status(400).send("User Id and Job Id are not provided");
    } else {
        try {
            await ConnectDB();
            const savedjob = new SavedJob(req.body);
            savedjob.save();
            res.status(200).json({
                res: "ok",
                msg: "Job Saved Successfully",
            });
        } catch (error) {
            res.status(411).json({
                res: "ERROR",
                msg: "Error Adding Saved Job",
                error: error,
            });
        }
    }
});

//deleted saved job
userRoute.delete("/deletesavedjob/:id", userAuthentication, async (req: any, res) => {
    try {
        const id = req.params.id;
        await ConnectDB();
        await SavedJob.findOneAndDelete({ _id: id });
        res.status(411).json({
            res: "ok",
            msg: "Saved Job Deleted Successfully",
        });
    } catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Invalid Input Types",
            error: error,
        });
    }
});

// List Saved Jobs
userRoute.get("/listsavedjob/:id/:status", userAuthentication, async (req: any, res) => {
    try {
        const id = req.params.id;
        const status = req.params.status;
        await ConnectDB();
        const jobs = await SavedJob.findOne({ "userId": id, "Status": status });
        if (jobs !== null) {
            res.status(200).json({
                res: "ok",
                msg: "Saved Jobs fetch successfully",
                jobs: jobs,
            });
        } else {
            res.status(200).json({
                res: "Error",
                msg: "Jobs are not Saved",
            });
        }
    } catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Error fetching saved job details",
            error: error,
        });
    }
});

// follow User
userRoute.patch("/follow", userAuthentication, async (req: any, res) => {
    const followData = req.body.followData;
    try {
        await ConnectDB();
        const follow = new UserConnection(followData);
        follow.save();
        res.status(200).json({
            res: "ok",
            msg: "Follow the User Successfully",
        });
    } catch (error) {
        res.status(411).json({
            res: "ERROR",
            msg: "Error Adding Follow User",
            error: error,
        });
    }
});

// Update follow status
userRoute.patch("/following/:id", userAuthentication, async (req: any, res) => {
    try {
        const id = req.params.id;
        try {
            await ConnectDB();
            const newUpdate = await UserConnection.findOneAndUpdate({ _id: id }, { Status: "Following" });
            res.status(200).json({
                res: "ok",
                update: newUpdate,
            });
        } catch (error) {
            res.status(411).json({
                res: "Error",
                msg: "Error While Updating Follow Status",
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

// Fetch follow User
userRoute.patch("/fetchfollowuser/:id/:status", userAuthentication, async (req: any, res) => {
    try {
        const status = req.params.status;
        const id = req.params.id;
        await ConnectDB();
        const user = await UserConnection.find({ userId: id, status: status });
        if (user !== null) {
            res.status(200).json({
                res: "ok",
                msg: "Follow Users Fetch successfully",
                user: user,
            });
        } else {
            res.status(200).json({
                res: "Error",
                msg: "You didn't follow anyone",
            });
        }
    } catch (error) {
        res.status(411).json({
            res: "Error",
            msg: "Error Fetching  Follow Users.",
            error: error,
        });
    }
});

// Search The Job
userRoute.get("/search", async (req, res) => {                                         
    try {
        const tablename = req.query.tbl;
        if (!tablename) {
            return res.status(400).send("Table name not provided");
        }
        const Model = mongoose.model(tablename);
        if (!Model) {
            return res.status(404).send("Model not found");
        }
        const keyword: string | undefined = req.query.keyword as string | undefined;
        const location: string | undefined = req.query.location as string | undefined;        
        const query: {[key: string]: any} = {}; // Explicitly typing query

        if (keyword) {
            query.Title = { $regex: keyword, $options: "i" };
        }
        if (location) {
            const locationString: string = location.toString(); // Ensure location is string
            const locationRegex = new RegExp(locationString.replace(/ /g, "|"), "i");
            query["$or"] = [
                { "company.Address.city": { $regex: locationRegex } },
                { "company.Address.state": { $regex: locationRegex } },
                { "company.Address.location": { $regex: locationRegex } } // Include 'location' field if you have one
            ];
        }
        if (tablename === "jobs") {
            const jobs = await Model.aggregate([
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
        } else {
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
            const list = await Model.find({ $or: orQuery });
            res.send(list);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Fetch Jobs
userRoute.get('/jobs', async (req, res) => {
    try {
        const { title, id } = req.query;
        let query = {};
        if (title) {
            // query.Title = { $regex: title, $options: 'i' };
        }
        if (id) {
            // query._id = id;
        }
        const jobs = await Job.find(query);
        // res.json(jobs);
        res.status(200).json({
            res: "ok",
            jobs: jobs
        })
    } catch (err) {
        console.error(err);
        // res.status(500).json({ error: 'Server Error' });
        res.status(500).json({
            res: "Error",
            msg: "Server Error"
        })
    }
});

// User Who Perform Follow
userRoute.post("/userWhoPerformFollow", userAuthentication, async (req, res) => {
    const id = req.body.userId;
    if (!id) {
        return res.status(400).send("User Id and Job Id are not provided");
    } else {
        const finaldata = new userFollow(req.body);
        userFollow.insertMany(finaldata)
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
})

// User Who Perform Follow Ti Company
userRoute.post("/userWhoPerformFollowToCompany", userAuthentication, async (req, res) => {
    const id = req.body.userId;
    if (!id) {
        return res.status(400).send("User Id and Job Id are not provided");
    } else {
        const finaldata = new CompanyConnection(req.body);
        CompanyConnection.insertMany(finaldata)
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
})

// Fetch Followers
userRoute.get("/myFollowers/:id", async (req, res) => {
    try {
        const id = req.params.id
        const users = await userFollow.find({ "userId": id });
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
})

// Fetch Not Followed User
userRoute.get("/notFollowed/:userId/:limit", userAuthentication, async (req, res) => {
    try {
        const { userId, limit } = req.params; // Assuming you have authenticated the user and have access to user's ID
        const limitNumber = parseInt(limit, 10);
        // Find all users who are not followed by the current user
        const usersNotFollowed = await userFollow.findOne({ userId: userId })
        if (usersNotFollowed) {
            const users = await Users.find({
                $and: [
                    { _id: { $ne: userId } },
                    { _id: { $nin: usersNotFollowed.targetId } }
                ]
            }).limit(limitNumber);
            res.status(201).json({
                res: "ok",
                users: users
            });
        } else {
            res.status(400).json({
                res: "Error",
                message: "user not found"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            res: "Error",
            message: "Server Error"
        });
    }
});

// Fetch Not Followed Company
userRoute.get("/notFollowedCompany/:userId/:limit", userAuthentication, async (req, res) => {
    try {
        const { userId, limit } = req.params;
        const limitNumber = parseInt(limit, 10);
        const usersNotFollowed = await CompanyConnection.findOne({ userId: userId })
        if (usersNotFollowed) {
            const users = await Companys.find({
                $and: [
                    { _id: { $ne: userId } },
                    { _id: { $nin: usersNotFollowed.targetId } }
                ]
            }).limit(limitNumber);
            res.status(201).json({
                res: "ok",
                users: users
            });
        } else {
            res.status(404).json({
                res: "Error",
                message: "user not found"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            res: "Error",
            message: "Server Error"
        });
    }
});

// Fetch Followings
userRoute.get("/getFollowings/:id", userAuthentication, async (req, res) => {
    try {
        const users = await userFollow.find({ userId: req.params.id })
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
})

export default userRoute;