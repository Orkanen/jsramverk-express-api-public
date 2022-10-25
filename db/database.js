//------------MongoDB--------------------------------------------------------//
require('dotenv').config();
const mongo = require("mongodb").MongoClient;
//let dsn = `mongodb+srv://${process.env.ATLAS_USERNAME}:${process.env.ATLAS_PASSWORD}@cluster0.6cra4pe.mongodb.net/mumin?retryWrites=true&w=majority`

const database = {
    getDb: async function getDb(collectionName = "crowd") {
        let dsn = `mongodb+srv://${process.env.ATLAS_USERNAME}:${process.env.ATLAS_PASSWORD}@cluster0.6cra4pe.mongodb.net/mumin?retryWrites=true&w=majority`

        if (process.env.NODE_ENV === 'test') {
            dsn = "mongodb://localhost:27017/test";
        }
   
        const client  = await mongo.connect(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    
        const db = await client.db();
        const collection = await db.collection(collectionName);
       
        return {
            client: client,
            db: db,
            collection: collection
        };
    }
}

module.exports = database;
