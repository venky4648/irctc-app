import WalletRepository from "../repositories/WalletRepository.js";
import { pool } from "../../../shared/utils/db.js";

class WalletService {
    async getWallet(userId) {
        let wallet = await WalletRepository.getWalletByUserId(userId);
        if (!wallet) {
            // Auto-create wallet if it doesn't exist
            wallet = await WalletRepository.createWallet(null, userId);
        }
        return wallet;
    }

    async addMoney(userId, amount) {
        if (amount <= 0) {
            const err = new Error("Amount must be greater than zero");
            err.statusCode = 400;
            throw err;
        }

        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            
            let wallet = await WalletRepository.getWalletForUpdate(client, userId);
            if (!wallet) {
                wallet = await WalletRepository.createWallet(client, userId);
            }

            const newBalance = parseFloat(wallet.balance) + parseFloat(amount);
            const updatedWallet = await WalletRepository.updateBalance(client, userId, newBalance);
            
            await client.query("COMMIT");
            return updatedWallet;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    // Usually used internally by PaymentService
    async deductMoney(client, userId, amount) {
        const wallet = await WalletRepository.getWalletForUpdate(client, userId);
        if (!wallet || parseFloat(wallet.balance) < amount) {
            throw new Error("Insufficient wallet balance");
        }

        const newBalance = parseFloat(wallet.balance) - parseFloat(amount);
        return await WalletRepository.updateBalance(client, userId, newBalance);
    }
}

export default new WalletService();
