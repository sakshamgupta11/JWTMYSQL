import connection from "../confic/userDB.js";

const deleteUserWithToken = async (req, res) => {
    try {
        // Ensure user is authenticated (Middleware already adds req.user)
        if (!req.user || !req.user.id) {
            return res.status(401).json({ status: "failed", message: "Unauthorized user" });
        }

        const userIdToDelete = req.params.id; // The id should remain a string (UUID)
        const authenticatedUserId = req.user.id; // The authenticated user's id

        // Check if the authenticated user is trying to delete their own account
        if (authenticatedUserId !== userIdToDelete) {
            return res.status(403).json({ status: "failed", message: "Forbidden: You can only delete your own account" });
        }

        // Proceed with deleting the user
        await connection.promise().query('DELETE FROM storedata.users WHERE id = ?', [userIdToDelete]);

        return res.status(200).json({ status: "success", message: "User has been deleted successfully" });

    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ status: "failed", message: "Internal server error" });
    }
};

export default deleteUserWithToken;
