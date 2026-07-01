import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Gmail validation
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ message: "Email must be a @gmail.com address" });
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }

    // Check if user exists
    const userExistsResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExistsResult.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const insertUserText = `
      INSERT INTO users (username, email, mobile_number, password_hash, status)
      VALUES ($1, $2, $3, $4, 'ACTIVE')
      RETURNING id, username, email, mobile_number, status
    `;
    const insertUserValues = [name, email, phone, hashedPassword];
    
    const result = await pool.query(insertUserText, insertUserValues);
    const user = result.rows[0];

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        phone: user.mobile_number,
        role: role || "user"
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // COMPARE PASSWORD
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        phone: user.mobile_number,
      }
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// GET USER PROFILE
export const getUserProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.username,
        email: req.user.email,
        phone: req.user.mobile_number,
      }
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// UPDATE OWN PROFILE
export const updateMyProfile = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = result.rows[0];

    const updatedName = name || user.username;
    const updatedEmail = email || user.email;
    const updatedPhone = phone || user.mobile_number;
    let updatedPasswordHash = user.password_hash;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedPasswordHash = await bcrypt.hash(password, salt);
    }

    const updateQuery = `
      UPDATE users 
      SET username = $1, email = $2, mobile_number = $3, password_hash = $4
      WHERE id = $5
      RETURNING id, username, email, mobile_number
    `;
    const updateResult = await pool.query(updateQuery, [updatedName, updatedEmail, updatedPhone, updatedPasswordHash, req.user.id]);

    res.status(200).json({
      success: true,
      user: {
        id: updateResult.rows[0].id,
        name: updateResult.rows[0].username,
        email: updateResult.rows[0].email,
        phone: updateResult.rows[0].mobile_number
      }
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// ADMIN: UPDATE USER PROFILE
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;
    const userId = req.params.id;

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = result.rows[0];

    const updatedName = name || user.username;
    const updatedEmail = email || user.email;
    const updatedPhone = phone || user.mobile_number;
    const updatedStatus = status || user.status;
    
    // In our new schema, roles are in user_roles, but we'll mock it for now
    // or just update the users table if we added a role column later. 
    // The previous Mongoose model had a 'role' field.
    
    const updateQuery = `
      UPDATE users 
      SET username = $1, email = $2, mobile_number = $3, status = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, username, email, mobile_number, status
    `;
    const updateResult = await pool.query(updateQuery, [updatedName, updatedEmail, updatedPhone, updatedStatus, userId]);

    res.status(200).json({
      success: true,
      user: {
        id: updateResult.rows[0].id,
        name: updateResult.rows[0].username,
        email: updateResult.rows[0].email,
        phone: updateResult.rows[0].mobile_number,
        status: updateResult.rows[0].status
      }
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// ADMIN: DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};

// ADMIN: GET ALL USERS
export const getAllUsersByAdmin = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username as name, email, mobile_number as phone, status, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.status(200).json({
      success: true,
      users: result.rows
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};