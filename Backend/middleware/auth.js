import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Frontend sends token like: Authorization: Bearer token_here
        if(!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({error: "Please login first"});
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if(!user) {
            return res.status(401).json({error: "User not found"});
        }

        // Now every protected route can use req.user
        req.user = user;
        next();
    } catch(err) {
        res.status(401).json({error: "Invalid or expired token"});
    }
};

export default auth;
