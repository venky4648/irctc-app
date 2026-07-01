import crypto from "crypto";

class PNRService {
    generatePNR() {
        // IRCTC PNR format: 10-digit number.
        // E.g., 2 followed by 9 random digits.
        const prefix = "2"; // 2 or 4 or 6 depending on zone, simplifying to 2
        const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
        return prefix + randomDigits;
    }
}

export default new PNRService();
