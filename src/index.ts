import express from "express";
import userRoute from "./routes/user";
import companyRoute from "./routes/company";
import apiRoute from "./routes/commonApi";
import cors from "cors";

const PORT = 5500;
const app = express();

require("dotenv").config();
app.use(express.json());
app.use(cors());

app.use("/user", userRoute);
app.use("/company", companyRoute);
app.use("/apiRoute", apiRoute);

app.listen(PORT, () => {
  console.log("Server is Running on port ", PORT);
});
