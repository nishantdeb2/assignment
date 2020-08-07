const zlib = require('zlib');
const mongo = require('./mongoService');
const fs = require('fs');
const pathSeparator = require('path').sep;
const {resolve} = require('path');
const commonFun = require('./commonFunction');
const assert = require("assert");
const child_process = require('child_process');
const {performance} = require('perf_hooks');
const constants = require('./constant');
const {validatebody,schemas} =require('../routes/validator.js')	

const environment = {
	name: process.env.NODE_ENV,
	deployed_on: new Date(),
};

class API {

	constructor() {

		this.mongo = mongo.connections;
		this.environment = environment;
		this.wait =  (ms) => {

					  return new Promise(resolve => {
					    setTimeout(resolve, ms);
					  });
					}

	}

	static setup() {

		API.endpoints = new Map;

		function walk(directory) {

			for (const file of fs.readdirSync(directory)) {

				const path = resolve(directory, file).replace(/\//g, pathSeparator);

				if (fs.statSync(path).isDirectory()) {
					walk(path);
					continue;
				}

				if (!path.endsWith('.js'))
					continue;

				const module = require(path);

				for (const key in module) {

					// Make sure the endpoint extends API class
					if (module.hasOwnProperty(key) && module[key] && module[key].prototype && module[key].prototype.__proto__.constructor == API)
						API.endpoints.set([path.slice(0, -3), key].join(pathSeparator), module[key]);
				}
			}
		}

		walk(__dirname + '/../www');
	}

	static serve() {

		return async function (request, response, next) {

			const st = performance.now();

			let obj;

			try {

				const
					url = request.url.replace(/\//g, pathSeparator),
					path = resolve(__dirname + '/../www') + pathSeparator + url.substring(4, url.indexOf('?') < 0 ? undefined : url.indexOf('?'));

				if (!API.endpoints.has(path) ) {

					return next();
				}

				let endpoint = API.endpoints.get(path);

				obj = new endpoint();
				obj.request = request;
				obj.response = response;


				let
					token = request.query.token || request.body.token || request.headers.token,
					userDetails
				;

				if(!constants.publicEndpoints.includes(url.split('?')[0]) && !token){

					throw new API.Exception(401, 'User Not Authenticated!');
				}

				if (token) {

					obj.user  = userDetails = await commonFun.verifyJWT(token);

					if (userDetails.error){
						throw new API.Exception(401, userDetails.message);
					}
	
				}


				const params = {...request.query, ...request.body};

				if(schemas.hasOwnProperty(`${path.split(pathSeparator).pop()}Schema`)){
					const validator = validatebody(params, schemas[`${path.split(pathSeparator).pop()}Schema`]);
					
					if(validator.status == 400)
						throw new API.Exception(400, validator.message);
				}

				const result = await obj[path.split(pathSeparator).pop()](params);

				obj.result = {
					status: result ? 200 : false,
					data: result,
				};

				await obj.gzip();

				response.set({'Content-Encoding': 'gzip'});
				response.set({'Content-Type': 'application/json'});

				response.send(obj.result);
				console.log('Time Taken = ' ,performance.now() - st, '\n\n')
			}

			catch (e) {
				console.log(e)
				if(e.pass) {
					return ;
				}

				if (e instanceof API.Exception) {

					return response.status(e.status || 500).send({
						status: e.status,
						message: e.message,
					});
				}

				if (!(e instanceof Error)) {

					e = new Error(e);
					e.status = 401;
				}

				if (e instanceof assert.AssertionError) {

					if (commonFun.isJson(e.message)) {
						e.message = JSON.parse(e.message);
					}
					e.status = e.message.status || 400;
					e.message = e.message.message || (typeof e.message === typeof "string" ? e.message : "Something went wrong! :(");
				}

				else {

					return response.status(e.status || 500).send({
						status: false,
						message: e.message,
					});
				}

				return next(e);
			}
		}
	}

	async gzip() {

		return new Promise((resolve, reject) => {
			zlib.gzip(JSON.stringify(this.result), (error, result) => {

				if (error)
					reject(['API response gzip compression failed!', error]);

				else {
					this.result = result;
					resolve();
				}
			});
		});
	}

	assert(expression, message, statusCode) {
		if(!expression)
			throw new API.Exception(statusCode, message)
	}

}

API.Exception = class {

	constructor(status, message) {

		this.status = status;
		this.message = message;

		console.error("API Exception Error!!!!", this);
		console.trace();
	}
}

module.exports = API;
API.setup();