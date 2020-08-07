const {MongoClient} = require('mongodb');
const {flattenObject} = require('./commonFunction');
const config = require("config");
const mongo_db = config.has("mongo_db") ? config.get("mongo_db") : {};
const models = require('../model');

exports.connections = {};

(async () => {
	await new Promise((resolve, reject) => {

		const url = !config.has("mongo_db.password") ?'mongodb://localhost:27017':`mongodb://${mongo_db[config].user ? mongo_db[config].user + ':' + mongo_db[config].password + '@': ''}${mongo_db[config].host}:${mongo_db[config].port || 27017}/${mongo_db[config].db}`;

		MongoClient.connect(url ,{
		useUnifiedTopology: true,
		useNewUrlParser: true,
		}, function (err, db) {

			if (err) return reject(err);
			exports.connections[process.env.NODE_ENV] = db;
			for(model in models) {
				models[model].collection();
			}
			console.log("\t\t@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
			console.log("\t\t@@@@@  Mongo Db connected to  :",process.env.NODE_ENV,"  @@@@@")
			console.log("\t\t@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
			return resolve(db);
		});
	});
})();
