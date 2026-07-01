import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserRepository from "../repositories/UserRepository.js";

class AuthService {
    generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    }

    async register(data) {
        const { name, email, phone, password } = data;

        // Validation
        if (!name || !email || !phone || !password) {
            const err = new Error("All fields are required");
            err.statusCode = 400;
            throw err;
        }

        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(email)) {
            const err = new Error("Email must be a @gmail.com address");
            err.statusCode = 400;
            throw err;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            const err = new Error("Phone number must be 10 digits");
            err.statusCode = 400;
            throw err;
        }

        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            const err = new Error("User already exists");
            err.statusCode = 400;
            throw err;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await UserRepository.createUser(name, email, phone, hashedPassword);
        const token = this.generateToken(user.id);

        return { user, token };
    }

    async login(email, password) {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            const err = new Error("Invalid email or password");
            err.statusCode = 400;
            throw err;
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            const err = new Error("Invalid email or password");
            err.statusCode = 400;
            throw err;
        }

        const token = this.generateToken(user.id);
        
        return {
            user: {
                id: user.id,
                name: user.username,
                email: user.email,
                phone: user.mobile_number,
                status: user.status
            },
            token
        };
    }

    async getProfile(userId) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            const err = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }
        return {
            id: user.id,
            name: user.username,
            email: user.email,
            phone: user.mobile_number,
            status: user.status
        };
    }

    async updateProfile(userId, data) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            const err = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }

        const updatedName = data.name || user.username;
        const updatedEmail = data.email || user.email;
        const updatedPhone = data.phone || user.mobile_number;
        const updatedStatus = data.status || user.status;
        
        let updatedPasswordHash = user.password_hash;
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            updatedPasswordHash = await bcrypt.hash(data.password, salt);
        }

        const updatedUser = await UserRepository.updateUser(
            userId, updatedName, updatedEmail, updatedPhone, updatedPasswordHash, updatedStatus
        );

        return updatedUser;
    }

    async deleteUser(userId) {
        const deletedUser = await UserRepository.deleteUser(userId);
        if (!deletedUser) {
            const err = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }
        return deletedUser;
    }

    async getAllUsers() {
        return await UserRepository.findAll();
    }
}

export default new AuthService();
