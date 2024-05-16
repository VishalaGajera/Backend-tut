import { jwtpassword } from "../config";
import jwt from "jsonwebtoken";

export const userAuthentication = (req: any, res: any, next: any) => {
  try {
    const auth = req.headers.authorization;
    const token = auth.split(" ")[1];

    try {
      if (token) {
        const verify: any = jwt.verify(token, jwtpassword);
        if (verify.status === "user") {
          req.email = verify.email;
          next();
        } else {
          res.status(200).json({
            res: "Error",
            msg: "Invalid Credentials for user",
          });
        }
      } else {
        res.status(200).json({
          res: "Error",
          msg: "Invalid auth token",
        });
      }
    } catch (error) {
      res.status(411).json({
        res: "Error",
        msg: "Error varifying auth token" + token,
        error: error,
      });
    }
  } catch (error) {
    res.status(411).json({
      res: "Error",
      msg: "Invalid Auth Token" + error,
    });
  }
};

export const companyAuthentication = (req: any, res: any, next: any) => {
  try {
    const auth = req.headers.authorization;
    const token = auth.split(" ")[1];

    try {
      if (token) {
        const verify: any = jwt.verify(token, jwtpassword);
        if (verify.status === "company") {
          req.email = verify.email;
          next();
        } else {
          res.status(200).json({
            res: "Error",
            msg: "Invalid Credentials for company",
          });
        }
      } else {
        res.status(200).json({
          res: "Error",
          msg: "Invalid auth token",
        });
      }
    } catch (error) {
      res.status(411).json({
        res: "Error",
        msg: "Error varifying auth token" + token,
        error:error
      });
    }
  } catch (error) {
    res.status(411).json({
      res: "Error",
      msg: "Invalid Auth Token" + error,
      error:error
    });
  }
};
