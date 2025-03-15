import connection from "../confic/userDB.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

class userControllers {
  static userRegistration = async (req, res) => {
    try {
        const { name, email, password, password_confirmation, tc } = req.body;

        if (!name || !email || !password || !password_confirmation || tc !== true) {
            return res.status(400).json({ status: "failed", message: "All fields are required" });
        }

        if (password !== password_confirmation) {
            return res.status(400).json({ status: "failed", message: "Password and confirm password do not match" });
        }

        // Check if email already exists
        const [existingUser] = await connection.promise().query(
            "SELECT * FROM storedata.users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ status: "failed", message: "Email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Generate JWT token first
        const token = jwt.sign({ userID: uuidv4() }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" });

        // Insert user into the database
        const uuid = uuidv4();
        const [result] = await connection.promise().query(
            "INSERT INTO storedata.users (id, name, email, password, tc, token) VALUES (?, ?, ?, ?, ?, ?)",
            [uuid, name, email, hashPassword, tc, token]
        );

        // Return success response with token
        return res.status(201).json({ 
            status: "success", 
            message: "User registered successfully", 
            token: token 
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: "failed", message: "Error in inserting data" });
    }
};


  ////////////////////////////////////////////////

  static userLogin = async (req, res) => {
    try {
      const { email, password, tc } = req.body
      if (!email || !password || !tc) {
        return res.status(400).json({ status: "faild", message: "All field are required" })
      }
      const [checkuser] = await connection.promise().query(
        'SELECT * FROM storedata.users where email =?', [email]
      )
      if (!checkuser.length > 0) {
        return res.status(400).json({ status: "failed", message: "user does not exist" })
      }
      // const [checkpass] = await connection.promise().query(
      //   'SELECT * FROM storedata.users where password =?', [password]
      // )
      // const isMatch = bcrypt.compare(password, checkpass)
      // if (checkuser === email && checkpass === isMatch) {
      // const token = jwt.sign({userID: user._id},process.env.JWT_SECRET_KEY,{expiresIn:'5d'})
      //   return res.status(200).json({ status: "success", message: "user login successfully", "token": token })
      // }

      const user = checkuser[0]; // Extract user details

      // Compare entered password with hashed password from DB
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ status: "failed", message: "Incorrect password or email" });
      }

      // Generate JWT token after successful authentication
      const token = jwt.sign({ userID: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });

      await connection.promise().query(
        "UPDATE storedata.users SET token = ? WHERE id = ?",
        [token, user.id]
    );


       res.status(200).json({ status: "success", message: "User login successful", "token": token });
    } catch (error) {

      res.status(400).json({ status: "failed", message: "error in login" })
    }
  }

  /////////////////////////////////////////////////

  static userForgetPassword = async (req, res) => {
    try {
      const { email, password, newpass, tc } = req.body;

      // Check if all fields are provided
      if (!email || !password || !newpass || !tc) {
        return res.status(400).json({ status: "failed", message: "All fields are required" });
      }

      // Check if user exists
      const [checkUser] = await connection.promise().query(
        'SELECT * FROM storedata.users WHERE email = ?', [email]
      );

      if (checkUser.length === 0) {
        return res.status(400).json({ status: "failed", message: "User does not exist" });
      }

      const user = checkUser[0]; // Extract user details

      // Compare entered password with hashed password from DB
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ status: "failed", message: "Incorrect old password or email" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(newpass, salt);

      // Update password in database
      await connection.promise().query(
        'UPDATE storedata.users SET password = ? WHERE email = ?', [hashPassword, email]
      );

      return res.status(200).json({ status: "success", message: "Password updated successfully" });
    }
    catch (error) {
      console.log(error);
      return res.status(500).json({ status: "failed", message: "Error in updating password" });
    }
  };


}

export default userControllers;
