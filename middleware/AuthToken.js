import jwt from 'jsonwebtoken';
import connection from "../confic/userDB.js";

const checkAuthtoken = async (req, res, next) => {
    let token;
    const { authorization } = req.headers;

    // Check if the authorization header is provided and starts with "Bearer"
    if (authorization && authorization.startsWith("Bearer")) {
        try {
            // Extract token from the "Bearer <token>" format
            token = authorization.split(" ")[1];
            // console.log("Authorization Token:", authorization);

            // Verify JWT token and extract user ID
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
            // console.log("Verified User ID:", userID);

            // Fetch user details from the database (excluding password)
            const [rows] = await connection.promise().query(
                'SELECT id, name, email, created_at FROM storedata.users WHERE id = ?',
                [userID]
            );

            // Check if user exists in the database
            if (rows.length === 0) {
                return res.status(401).json({ status: "failed", message: "Unauthorized user" });
            }

            // Attach user data to the request object for further processing
            req.user = rows[0];

            // Move to the next middleware or route handler
            next();
        } catch (error) {
            console.error("JWT Verification Error:", error);
            return res.status(401).json({ status: "failed", message: "Unauthorized user" });
        }
    } else {
        // Return error if the token is missing
        return res.status(400).json({ status: "failed", message: "Unauthorized: No token provided" });
    }
};

export default checkAuthtoken;
