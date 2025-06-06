import { User } from "../models/user.model.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const registerUser = async (req, res) => {
  try {
    const { fullname, email, password, phonenumber } = req.body;

    if (!fullname || !email || !password || !phonenumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      phonenumber,
    });

    const createdUser = await User.findById(user._id).select("-password");
    if (!createdUser) {
      throw new Error("User creation failed");
    }

    return res.status(201).json({
      message: "User registered successfully",
      user: createdUser,
    });
  } catch (error) {
    console.error(error.message || error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User  not found." });
    }

   
    const isPasswordValid = await user.ispasswordcorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    
    const token = await user.generateaccesstoken();

    
    const loggedInUser = await User.findById(user._id).select("-password");

res.cookie("accessToken", token, {
  httpOnly: true,
  secure: true,        
  sameSite: "None",    
  maxAge: 86400000,    
});


    console.log("Generated Token:", token);


   
    return res.status(200).cookie("accessToken", token).json({
      user: loggedInUser,
      accessToken: token,
      message: "User  Loggede  In successfully",
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

const logoutUser  = async (req, res) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(400).json({ message: "No access token provided" });
    }

   console.log(token)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 
    } catch (err) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    // Clear the cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    });

    // Optionally, you can also remove the token from the user record if you store it
    // await User.findByIdAndUpdate(decoded._id, { $unset: { accessToken: "" } });

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `http://localhost:5173/resetPassword/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background: blue; color: white; padding: 10px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) return res.status(400).json({ message: "Token is required" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const userLoggedInController = async (req, res) => {
  try {
  
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      console.log("No token provided");
      return res.status(200).json({ isLoggedIn: false });
    }

   
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      console.log("Token verification failed:", error.message);
      return res.status(200).json({ isLoggedIn: false });
    }
    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      console.log("User not found");
      return res.status(200).json({ isLoggedIn: false });
    }
    console.log("User is logged in:", user.email);
    return res.status(200).json({ isLoggedIn: true, user });
  } catch (error) {
    console.error("Unexpected error in userLoggedInController:", error.message);
    return res.status(500).json({ message: "Internal server error", isLoggedIn: false });
  }
};


export {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  userLoggedInController,
};
