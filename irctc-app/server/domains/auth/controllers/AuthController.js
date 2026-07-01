import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import AuthService from "../services/AuthService.js";

export const registerUser = asyncHandler(async (req, res) => {
    const { user, token } = await AuthService.register(req.body);
    
    res.status(201).json({
        success: true,
        token,
        user: {
            id: user.id,
            name: user.username,
            email: user.email,
            phone: user.mobile_number,
            role: req.body.role || "user" // Hardcoded role fallback for compatibility
        }
    });
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    res.status(200).json({
        success: true,
        ...result
    });
});

export const getUserProfile = asyncHandler(async (req, res) => {
    // req.user is set by authMiddleware
    const profile = await AuthService.getProfile(req.user.id);
    
    res.status(200).json({
        success: true,
        user: profile
    });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
    const updatedUser = await AuthService.updateProfile(req.user.id, req.body);
    
    res.status(200).json({
        success: true,
        user: {
            id: updatedUser.id,
            name: updatedUser.username,
            email: updatedUser.email,
            phone: updatedUser.mobile_number,
            status: updatedUser.status
        }
    });
});

// Admin routes
export const updateUserProfile = asyncHandler(async (req, res) => {
    const updatedUser = await AuthService.updateProfile(req.params.id, req.body);
    
    res.status(200).json({
        success: true,
        user: {
            id: updatedUser.id,
            name: updatedUser.username,
            email: updatedUser.email,
            phone: updatedUser.mobile_number,
            status: updatedUser.status
        }
    });
});

export const deleteUser = asyncHandler(async (req, res) => {
    await AuthService.deleteUser(req.params.id);
    
    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
});

export const getAllUsersByAdmin = asyncHandler(async (req, res) => {
    const users = await AuthService.getAllUsers();
    
    res.status(200).json({
        success: true,
        users
    });
});
