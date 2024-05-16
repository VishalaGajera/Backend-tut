"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./routes/user"));
const company_1 = __importDefault(require("./routes/company"));
const commonApi_1 = __importDefault(require("./routes/commonApi"));
const cors_1 = __importDefault(require("cors"));
const PORT = 5500;
const app = (0, express_1.default)();
require("dotenv").config();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/user", user_1.default);
app.use("/company", company_1.default);
app.use("/apiRoute", commonApi_1.default);
app.listen(PORT, () => {
    console.log("Server is Running on port ", PORT);
});
