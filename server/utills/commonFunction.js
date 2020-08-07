
const constants = require('./constant');
const jwt = require('jsonwebtoken');
const config = require('config');
const promisify = require('util').promisify;
const jwtVerifyAsync = promisify(jwt.verify, jwt);
const mongo = require('./mongoService');
const ObjectID = require('mongodb').ObjectID;
        
function isJson(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

function makeJWT(obj) {

	obj = {
		data: encodeURIComponent(JSON.stringify(obj)),
	};

	return jwt.sign(obj, config.get('secret_key'));

}


async function verifyJWT(token) {

	try {

		let verifiedToken = (await (jwtVerifyAsync(token, config.get('secret_key'))));

		if (!verifiedToken.data) {

			throw Error('Error in JWT');
		}

		verifiedToken = {
			...JSON.parse(decodeURIComponent(verifiedToken.data)),
		};

		return verifiedToken;

	}
	catch (e) {

		return {
			error: true,
			message: e.message
		}
	}
}

async function getUserDetailsJWT(token) {

	const details = await verifyJWT(token);

	if (!details.error) {
		return details;
	}

	if (details.error && details.message != 'jwt expired') {
		return details;
	}

	let token_details = [];

	try {
		token_details = JSON.parse(decodeURIComponent(atob(token.split('.')[1])));
	}
	catch (e) {
	}

	return token_details;
}

async function find(collection, query){
	const	
		mongoConection  = mongo.connections,
		db = await mongoConection[process.env.NODE_ENV].db('assignment'),
		Collection = db.collection(`${collection}`),
		promise = new Promise((resolve, reject)=>{
			Collection.find(query).toArray((err, result)=>{
				if(err)
					return reject(err)

				return resolve(result)
			})
		})
	;
	return await promise;
}

async function insertOne(collection, insertObj){
	
	const
		mongoConection  = mongo.connections,	
		db = await mongoConection[process.env.NODE_ENV].db('assignment'),
		Collection = db.collection(`${collection}`),
		promise = new Promise((resolve, reject) => {

			Collection.insertOne(insertObj, (err, result) => {

			  if(err)
				  return reject(err);

			  return resolve(result);
		  })
	   })
	;
	return await promise;
}
async  function updateOne(collection, query, value){
	console.log(query, value)
	const
		mongoConection  = mongo.connections,	
		db = await mongoConection[process.env.NODE_ENV].db('assignment'),
		Collection = db.collection(`${collection}`),
		promise = new Promise((resolve, reject)=>{

			Collection.updateOne(query, value, (err, result)=>{
				if(err)
					return reject(err)

				return resolve(result)
			})
		})
	;
	return await promise
}

async function aggregate(collection, aggreagte){

	const	
		mongoConection  = mongo.connections,
		db = await mongoConection[process.env.NODE_ENV].db('assignment'),
		Collection = db.collection(`${collection}`),
		promise = new Promise((resolve, reject)=>{
			Collection.aggregate(aggreagte).toArray((err, result)=>{
				if(err)
					return reject(err)

				return resolve(result)
			})
		})
	;
	return await promise;
}

exports.isJson = isJson;
exports.makeJWT = makeJWT;
exports.verifyJWT = verifyJWT;
exports.getUserDetailsJWT = getUserDetailsJWT;
exports.find = find;
exports.insertOne = insertOne;
exports.updateOne = updateOne;
exports.aggregate = aggregate;

