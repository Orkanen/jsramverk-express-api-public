process.env.NODE_ENV = 'test';

const { should, expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');

chai.should();

chai.use(chaiHttp);

const database = require("../db/database.js");
const collectionName = "crowd";

describe('Editor', () => {
    before(() => {
        return new Promise(async (resolve) => {
            const db = await database.getDb();

            db.db.listCollections(
                { name: collectionName }
            )
                .next()
                .then(async function (info) {
                    if (info) {
                        await db.collection.drop();
                    }
                })
                .catch(function (err) {
                    console.error(err);
                })
                .finally(async function () {
                    await db.client.close();
                    resolve();
                });
        });
    });

    describe('GET /list', () => {
        it('200 LIST PATH', (done) => {
            chai.request(server)
                .get("/list")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(0);

                    done();
                });
        });
    });

    describe('POST /list/create', () => {
        it('201 Creating new document', (done) => {
            let list = {
                title: "Lorem",
                text: "Ipsum!"
            };

            chai.request(server)
                .post("/list/create")
                .send(list)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");
                    res.body.data.should.have.property("docTitle");
                    res.body.data.should.have.property("docTitle").and.to.be.equal("Lorem");

                    done();
                });
        });

        it('200 LIST PATH', (done) => {
            chai.request(server)
                .get("/list")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(1);

                    done();
                });
        });

    });

    describe('PATCH /list/update', () => {
        var setId = "";
        it('200 LIST PATH', (done) => {
            chai.request(server)
                .get("/list")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(1);

                    done();
                });
        });

        it('200 Update document', (done) => {
            chai.request(server)
                .get("/list")
                .end((err, res) => {
                    //console.log(Object.values(JSON.parse(res.text))[0][0]._id);
                    setId = Object.values(JSON.parse(res.text))[0][0]._id;
                    let list = {
                        title: "Updated Title!",
                        id: Object.values(JSON.parse(res.text))[0][0]._id
                    }
                    chai.request(server)
                        .patch("/list/update")
                        .send(list)
                        .end((err, result) => {
                            //console.log(result.text);
                            result.should.have.status(200);
                            result.body.should.be.an("object");
                            result.body.should.have.property("data");
                            result.body.data.should.have.property("docTitle");
                            result.body.data.should.have.property("docTitle").and.to.be.equal("Updated Title!");
        
                            done();
                        });
                });
        });

        it('200 LIST PATH', (done) => {
            chai.request(server)
                .get("/list")
                .end((err, res) => {
                    //console.log(res.text);
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");
                    res.body.data.length.should.be.equal(1);
                    expect(res.text.includes(setId)).to.be.true;

                    done();
                });
        });
        
    });
});
