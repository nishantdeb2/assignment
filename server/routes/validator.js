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
    
  },

    schemas:{
    //   addSchema:joi.object({
    //     name:joi.string().required(),
    //     email:joi.string().email().required()    
    //   })  
    }
}