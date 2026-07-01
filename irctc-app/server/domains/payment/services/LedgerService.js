import LedgerRepository from "../repositories/LedgerRepository.js";
import { logger } from "../../../shared/utils/logger.js";

class LedgerService {
    async postLedgerEntry(client, creditAccount, debitAccount, amount, refId) {
        if (amount <= 0) {
            throw new Error("Ledger amount must be greater than zero");
        }

        const entries = await LedgerRepository.postDoubleEntryTransaction(client, creditAccount, debitAccount, amount, refId);
        
        logger.info("Ledger Posted", { 
            debit: debitAccount.name, 
            credit: creditAccount.name, 
            amount, 
            refId 
        });
        
        return entries;
    }
}

export default new LedgerService();
