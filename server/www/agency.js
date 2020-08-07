const API = require("../utills/api");
const commonFun = require("../utills/commonFunction");
const client = require("./client").add;

exports.add = class extends API{
    async add({agnecyDetails, clientDetails}={}){
        
        const
            obj = new agency(agnecyDetails, this),
            agencyDetail = await obj.checkAgency()
        ;

        const
            clientObj = new client(),
            params = {
                agentId : agencyDetail._id,
                clientDetails : clientDetails
            },
            result = await clientObj['add'](params);
        ;

        const   
            response = {
                AgentAdded : agencyDetail.isAdded,
                AgentName : agencyDetail.name,
                clientName : result.name,
                clientAdded :  result.isAdded,
                clientID : result._id,
                message: result.message
            }
        return response
        


    }
}

class agency {

    constructor(agnecyDetail, that){
        this.agency = agnecyDetail,
        this.that = that
    }

    async checkAgency(){
        
        const   
            query = {
                name : this.agency.name
            },
            agency = await commonFun.find('agency',query)
        ;
            console.log(agency)
        if(agency.length){
            agency[0].isAdded = 0;
            return agency[0];
        }

        return await this.addAgency();
    }

    async addAgency(){
        const 
            insertObj ={
                name : this.agency.name,
                address1 : this.agency.address1,
                address2 : this.agency.address2 ? this.agency.address2 : '',
                state : this.agency.state,
                city : this.agency.city,
                phone_number : this.agency.phone_number,
                createdAt : new Date(),
                modifiedAt :  new Date()
            },
            agency = await commonFun.insertOne('agency', insertObj)
        ;
        insertObj._id = agency.insertedId
        insertObj.isAdded = 1
        return insertObj;
    }
}
