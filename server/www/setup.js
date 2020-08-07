const API = require("../utills/api");
const commonFun = require("../utills/commonFunction");


exports.initilizeSetup = class extends API{

	async initilizeSetup(){

        const 
            obj ={
                dateTime : new Date(),
                server : process.env.NODE_ENV
            }
        ;
        
        console.log("################# Static Accesstoken ######################################");
        console.log(commonFun.makeJWT(obj));
        console.log("###########################################################################");
	}

}