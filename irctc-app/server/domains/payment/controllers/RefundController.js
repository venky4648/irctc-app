import { asyncHandler } from "../../../shared/middleware/errorHandler.js";
import RefundService from "../services/RefundService.js";

export const processRefund = asyncHandler(async (req, res) => {
    const refund = await RefundService.processRefund(req.user.id, req.body);
    res.status(201).json({ success: true, refund });
});

export const getRefund = asyncHandler(async (req, res) => {
    const refund = await RefundService.getRefund(req.params.id);
    res.status(200).json({ success: true, refund });
});
