import bcrypt from "bcrypt";
import connection from "../confic/userDB.js";
export const deleteUser = async (req, res) => {
    try {
        const { email, password, tc } = req.body
        if (!email || !password || tc !== true) {
            return res.status(400).json({ status: "failed", message: "all  field are required" })
        }
        const [checkUser] = await connection.promise().query(
            'select * from storedata.users where email =?', [email]
        )
        if (checkUser.length === 0) {
            return res.status(400).json({ status: "failed", message: "invalid email or password.." })
        }

        const user = checkUser[0]; // Extract user details

        // Compare entered password with hashed password from DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ status: "failed", message: "invalid email or password" });
        }
        await connection.promise().query(
            'delete from storedata.users where email =?',
            [email]
        )
        res.status(200).json({ status: "success", message: "user has been deleted successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal server error" })
    }
}