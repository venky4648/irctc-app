import { pool } from "../../../shared/utils/db.js";

class LedgerRepository {
    async postDoubleEntryTransaction(client, creditAccount, debitAccount, amount, refId) {
        // Double-entry accounting: 1 row for Debit, 1 row for Credit
        const query = `
            INSERT INTO ledger (account_type, account_name, transaction_reference_id, debit_amount, credit_amount)
            VALUES 
            ($1, $2, $3, $4, 0.00), -- Debit entry
            ($5, $6, $3, 0.00, $4)  -- Credit entry
            RETURNING *
        `;
        const values = [
            debitAccount.type, debitAccount.name, refId, amount,
            creditAccount.type, creditAccount.name
        ];
        
        const dbClient = client || pool;
        const result = await dbClient.query(query, values);
        return result.rows; // Returns both the debit and credit rows
    }
}

export default new LedgerRepository();
