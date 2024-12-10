import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import File from '../models/File.js';
import redisClient from '../utils/redis.js';

class FilesController {
    static async postUpload(req, res) {
        const token = req.headers['x-token'];
        const userId = await redisClient.get(`auth_${token}`);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { name, type, parentId = '0', isPublic = false, data } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Missing name" });
        }
        if (!type || !['folder', 'file', 'image'].includes(type)) {
            return res.status(400).json({ error: "Missing or invalid type" });
        }
        if (type !== 'folder' && !data) {
            return res.status(400).json({ error: "Missing data" });
        }

        // Verify parent folder
        if (parentId !== '0') {
            const parent = await File.findById(parentId);
            if (!parent) {
                return res.status(400).json({ error: "Parent not found" });
            }
            if (parent.type !== 'folder') {
                return res.status(400).json({ error: "Parent is not a folder" });
            }
        }

        let filePath;
        if (type !== 'folder') {
            const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
            const filename = uuidv4();
            filePath = path.join(folderPath, filename);
            const fileBuffer = Buffer.from(data, 'base64');
            fs.writeFileSync(filePath, fileBuffer);
        }

        const file = new File({
            userId,
            name,
            type,
            isPublic,
            parentId,
            localPath: filePath
        });

        await file.save();

        res.status(201).json({
            id: file._id,
            userId,
            name,
            type,
            isPublic,
            parentId
        });
    }
}

export default FilesController;

