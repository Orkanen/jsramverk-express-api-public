const database = require("../db/database.js");
const mongo = require("mongodb").MongoClient;
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();
const mailgun = require("mailgun-js");
const mg = mailgun({
	apiKey: process.env.MAILGUN_API_KEY,
	domain: process.env.MAILGUN_DOMAIN,
});

const editorList = {
    getAllDocs: async function getAllDocs() {
        let db;

        try {
            db = await database.getDb();

            const allDocs = await db.collection.find({}, {}).limit(0).toArray();

            return allDocs;
        } catch (error) {
            return {
                errors: {
                    message: error.message,
                }
            };
        } finally {
            await db.client.close();
        }
    },
    getUserDocs: async function getUserDocs(userEmail) {
        let db;

        try {
            db = await database.getDb();

            const allDocs = await db.collection.find({owners: userEmail}, {}).limit(0).toArray();

            //console.log(allDocs);
            return allDocs;
        } catch (error) {
            return {
                errors: {
                    message: error.message,
                }
            };
        } finally {
            await db.client.close();
        }
    },
    addToCollection: async function addToCollection(newText, newTitle, newOwner, newComments, code) {
        let db;

        try {
            db = await database.getDb();

            const result = await db.collection.insertOne({ docTitle: newTitle, docText: newText, owners: newOwner, comments: newComments, code: code});

            return {
                docTitle: newTitle,
                docText: newText,
                _id: result.insertedId,
            };
        } catch (error) {
            console.error(error.message);
        } finally {
            await db.client.close();
        }
    },
    updateDocumentCollection: async function updateDocumentCollection(newText, newTitle, id, comments, code) {
        let db;

        try {
            db = await database.getDb();

            const result = await db.collection.updateOne({_id: ObjectId(id)}, { $set: {docText: newText, docTitle: newTitle, comments: comments, code: code}});

            return {
                docTitle: newTitle,
                docText: newText,
                _id: result.insertedId};
        } catch (error) {
            console.error(error.message);
        } finally {
            await db.client.close();
        }
    },

    addOwner: async function addOwner(res, body) {
        let db = await database.getDb("users");
        let bodyOwner = (body.owner).toLowerCase();
        let bodyEmail = (body.email).toLowerCase();

        try {
            const query = { email: bodyOwner };
            const user = await db.collection.findOne(query);
            if (user) {
                let compare = await editorList.compareUsers(body.id, bodyOwner);
                let resultCompare = "";
                let emailResult = "";
                let data = {
                    from: `${bodyEmail}`,
                    to: [`${bodyOwner}`],
                    subject: "You have been added to document.",
                    text: `You have been added to document: ${body.id}`,
                }
                if (compare) {
                    try {
                        emailResult = await mg.messages().send(data);
                    } catch (error) {
                        emailResult = `Email could not be sent. ${error}`;
                    }
                    let db = await database.getDb("crowd");
                    const result = await db.collection.updateOne({_id: ObjectId(body.id)}, { $push: {owners: bodyOwner}});
                    resultCompare = (result['acknowledged']) ? "User added." : "User already added.";
                    return {
                        resultCompare,
                        emailResult
                    }
                } else {
                    throw new Error('User already added.');
                }
            } else {
                throw new Error('User not found.');
            }
        } catch (error) {
            return error.message;
        } finally {
            await db.client.close();
        }
    },

    updateAmounts: function updateAmounts(newAmounts) {
        Object.keys(newAmounts).forEach(async (id) => {
            await editorList.updateWine(id, newAmounts[id]);
        });
    },

    compareUsers: async function compareUsers(id, user) {
        let db;

        db = await database.getDb();
        const query = { _id:  ObjectId(id) };

        const allDocs = await db.collection.findOne(query);

        if (allDocs && !(allDocs.owners).includes(user)) {
            return true;
        } else {
            return false;
        }
    }
};

module.exports = editorList;
