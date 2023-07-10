import jwt from 'jsonwebtoken';
import * as dotenv from "dotenv";
dotenv.config();

// auth middleware
const auth = (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            return res
                .status(401)
                .json({ message: "no authentication token, authorization denied" });
        }
        
    const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log(verified);
        if (!verified) {
            return res
                .status(401)
                .json({ message: "token verification failed, authorization denied" });
        }
        
        req.id = verified.id;
        next();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }

};

export default auth;