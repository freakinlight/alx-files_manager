import crypto from 'crypto';
import User from '../models/User.js';
import redisClient from '../utils/redis.js';
import { v4 as uuidv4 } from 'uuid';

class AuthController {
    static async getConnect(req, res) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [email, password] = credentials.split(':');

        const hash = crypto.createHash('sha1').update(password).digest('hex');
        const user = await User.findOne({ email, password: hash });

        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = uuidv4();
        await redisClient.set(`auth_${token}`, user._id.toString(), 86400);

        res.status(200).json({ token });
    }

    static async getDisconnect(req, res) {
        const token = req.headers['x-token'];
        if (!token || !await redisClient.del(`auth_${token}`)) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        res.sendStatus(204);
    }
}

export default AuthController;

