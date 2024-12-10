import User from '../models/User.js';
import crypto from 'crypto'; // Node.js native crypto module

class UsersController {
    static async postNew(req, res) {
        const { email, password } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({ error: "Missing email" });
        }
        if (!password) {
            return res.status(400).json({ error: "Missing password" });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Already exist" });
        }

        // Hash password with SHA1
        const hash = crypto.createHash('sha1').update(password).digest('hex');

        // Create new user
        const newUser = new User({
            email,
            password: hash
        });

        await newUser.save();

        // Return the new user with only the email and the id
        return res.status(201).json({
            id: newUser._id,
            email: newUser.email
        });
    }
}

export default UsersController;
