import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const createToken = (userId) => {
    return jwt.sign(
        {id: userId},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN || "7d"}
    );
};

// Register new user
router.post("/register", async(req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({error: "All fields are required"});
    }

    try {
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(409).json({error: "Email already registered"});
        }

        // Never save plain password in database
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = createToken(user._id);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Registration failed"});
    }
});

// Login existing user
router.post("/login", async(req, res) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({error: "Email and password are required"});
    }

    try {
        const user = await User.findOne({email});
        if(!user) {
            return res.status(401).json({error: "Invalid email or password"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(401).json({error: "Invalid email or password"});
        }

        const token = createToken(user._id);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Login failed"});
    }
});

export default router;
