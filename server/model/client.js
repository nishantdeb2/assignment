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
        if(collections.includes('clients'))
            return

        db.createCollection("clients", {
			validator: {
				$jsonSchema: {
					bsonType: "object",
					required: [ "agency_id", "name", "email", "phone_number", "total_bill"],
					properties: {
						name: {
							bsonType: "string",
							description: "must be a string and is required"
						},
						agency_id: {
							bsonType: "objectId",
							description :"_id of aagency table and is required"
						},
						email: {
							type: "string",
							description: "must be a string and is required"
						},
						phone_number: {
							type: "string",
							description: "must be a string and is required"
                        },
                        total_bill: {
							bsonType: "int" ,
							description: "must be a  int and is required"
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


