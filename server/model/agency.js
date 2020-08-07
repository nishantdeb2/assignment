const mongo = require('../utills/mongoService');


module.exports = {

	collection: async () => {

		const
            db = await mongo.connections.dev.db('assignment'),
            promise = new Promise((resolve, reject)=>{
                db.listCollections().toArray(function(err, collections){
                    if(err)
                        return reject(err)

                    return  resolve(collections.map(x=>x.name))
                });
            }),
            collections = await promise
        ;
        if(collections.includes('agency'))
			return
			
		db.createCollection("agency", {
			validator: {
				$jsonSchema: {
					bsonType: "object",
					required: ['name', 'address1', 'state', 'city', 'phone_number'],
					properties: {
						name: {
							bsonType: "string",
							description: "must be a string and is required"
						},
						address1: {
							type: "string",
							description: "must be a string and is required"
						},
						address2: {
							type: "string",
							description: "must be a string and is optional"
						},
						state: {
							type: "string",
							description: "must be a string and is optional"
						},
						city: {
							type: "string",
							description: "must be a string and is optional"
						},
						phone_number: {
							type: "string",
							description: "must be a string and is optional"
						},
						createdAt: {
							bsonType: "date"
						},
						modifiedAt: {
							bsonType: "date"
						}
					}
				}
			},
			validationLevel: 'moderate',
			validationAction: 'error'
		})
	}

}


