import { MongoClient } from 'mongodb';

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || '27017';
        const database = process.env.DB_DATABASE || 'files_manager';

        const uri = `mongodb://${host}:${port}`;
        this.client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        this.client.connect()
            .then(() => {
                this.db = this.client.db(database);
                console.log('Successfully connected to MongoDB');
            })
            .catch((err) => {
                console.error('MongoDB connection failed:', err);
            });
    }

    isAlive() {
        return !!this.client && !!this.client.topology && this.client.topology.isConnected();
    }

    async nbUsers() {
        return await this.db.collection('users').countDocuments();
    }

    async nbFiles() {
        return await this.db.collection('files').countDocuments();
    }
}

const dbClient = new DBClient();
export default dbClient;
