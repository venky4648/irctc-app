import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import WalletService from "../services/WalletService.js";

export const getWallet = asyncHandler(async (req, res) => {
    const wallet = await WalletService.getWallet(req.user.id);
    res.status(200).json({ success: true, wallet });
});

export const addMoney = asyncHandler(async (req, res) => {
    const wallet = await WalletService.addMoney(req.user.id, req.body.amount);
    res.status(200).json({ success: true, wallet });
});
