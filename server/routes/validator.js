const joi = require('joi');

module.exports={
  validatebody:(req,schema)=>{
    const result = schema.validate(req);
    if(result.error)
    {   
        return {
            status : 400,
            message: result.error.details[0].message
        }
    }
    return {
        status : 200,
        message: result
    }
    
  },

    schemas:{
      addSchema:joi.object({
        agnecyDetails :joi.object({
            name: joi.string().required(),
            address1: joi.string().required(),
            address2: joi.string(),
            city: joi.string().required(),
            state: joi.string().required(),
            phone_number: joi.string().min(10).max(10).required(),
        }),
        clientDetails:joi.object({
            name: joi.string().required(),
            email: joi.string().email().required(),
            phone_number: joi.string().min(10).max(10).required(),
            total_bill: joi.number().integer().required()
        })
          
      }) ,
      editSchema :joi.object({
         id: joi.string().min(24).max(24).required(),
         name: joi.string(),
         email: joi.string().email(),
         phone_number: joi.string().min(10).max(10),
         total_bill: joi.number().integer()

      })
    }
}