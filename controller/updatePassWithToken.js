import bcrypt from 'bcrypt';
import connection from '../confic/userDB.js';

const updatePassWithToken = async (req, res) => {
    try {
        // Extract password and confirm_password from request body
        const { password, confirm_password } = req.body;

        // Validate if both fields are provided
        if (!password || !confirm_password) {
            return res.status(400).json({ status: "failed", message: "All fields are required." });
        }

        // Validate if password and confirm_password match
        if (password !== confirm_password) {
            return res.status(400).json({ status: "failed", message: "Password and Confirm Password do not match." });
        }

        // Generate salt and hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(password, salt);

        // Ensure user is authenticated before updating password
        if (!req.user || !req.user.id) {
            return res.status(401).json({ status: "failed", message: "Unauthorized user" });
        }

        // console.log("Updating password for user ID:", req.user.id);

        // Update password in the database
        await connection.promise().query(
            'UPDATE storedata.users SET password = ? WHERE id = ?', 
            [hashedNewPassword, req.user.id]
        );

        // Send success response
        return res.status(200).json({ status: "success", message: "Password updated successfully" });

    } catch (error) {
        // console.error("Error updating password:", error);
        return res.status(500).json({ status: "failed", message: "Internal server error" });
    }
};

export default updatePassWithToken;
