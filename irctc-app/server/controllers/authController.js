import User from "../models/User.js";
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
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Gmail validation
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(email)) {
      return res.status(400).json({
        message: "Email must be a @gmail.com address"
      });
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Phone number must be 10 digits"
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role === "admin" ? "admin" : "user";

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: userRole
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
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

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid User"
      });
    }

    // COMPARE PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user
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
      user: req.user
    });

  } catch (err) {

    res.status(500).json({
      message: "Server error",
      error: err.message
    });

  }

};



// UPDATE USER BY ADMIN

export const updateUserProfile = async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (req.user.role !== "admin") {
      return res.status(401).json({
        message: "Not authorized to update user profile"
      });
    }

    const { name, email, phone, role } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;

    await user.save();

    res.status(200).json({
      success: true,
      user
    });

  } catch (err) {

    res.status(500).json({
      message: "Server error",
      error: err.message
    });

  }

};



// DELETE USER

export const deleteUser = async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (req.user.role !== "admin") {
      return res.status(401).json({
        message: "Not authorized to delete user"
      });
    }

    await user.deleteOne();

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



// GET ALL USERS (ADMIN)

export const getAllUsersByAdmin = async (req, res) => {

  try {

    if (req.user.role !== "admin") {
      return res.status(401).json({
        message: "Not authorized to view users"
      });
    }

    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      users
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

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const { name, email, phone, password } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      user
    });

  } catch (err) {

    res.status(500).json({
      message: "Server error",
      error: err.message
    });

  }

};