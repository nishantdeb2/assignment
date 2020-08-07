const API = require("../utills/api");
const ObjectID = require('mongodb').ObjectID;

const commonFun = require("../utills/commonFunction");
const costantMessage =  require("../utills/constant").message;

exports.add = class extends API{
    async add({agentId, clientDetails}={}){
        
        const
            obj = new clients(clientDetails ,agentId, this),
            clientDetail = await obj.checkClient()
        ;

        return clientDetail
        


    }
}

class clients {

    constructor(clinetDetail, agentId, that){
        this.client = clinetDetail,
        this.agentId = agentId,
        this.that = that
    }

    async checkClient(){
        
        const   
            query = {
                name : this.client.name,
                agency_id : new ObjectID(this.agentId)
            },
            client = await commonFun.find('clients',query)
        ;
        
        if(client.length){
            client[0].message = costantMessage.CLIENT_ALREDY_EXISTS.message;
            client[0].isAdded = 0;
            return client[0];
        }

        return await this.addClient();
    }

    async addClient(){

        const 
            insertObj ={
                name : this.client.name,
                agency_id : new ObjectID(this.agentId),
                email : this.client.email,
                phone_number : this.client.phone_number,
                total_bill :  this.client.total_bill,
                createdAt : new Date(),
                modifiedAt : new Date()
            },
            client = await commonFun.insertOne('clients', insertObj)
        ;
        insertObj._id = client.insertedId
        insertObj.message =  costantMessage.CLIENT_ADDED_SUCCESSFULLY.message;
        insertObj.isAdded = 1;
        return insertObj;
    }
}

exports.edit =  class extends API{

    async edit({id=null, name=null, email=null, total_bill=null, phone_number=null}={}){

        this.id = id;
        await this.checkID();
        const   
            value = {
                "$set":{

                }
            }
        ;
        if(!name && !email && !total_bill && !phone_number){
            this.assert(false,costantMessage.NOTHING_TO_UPDATE.message, costantMessage.NOTHING_TO_UPDATE.status);

        }

        if(name){
            value['$set'].name = name;
        }
        if(email){
            value['$set'].email = email;
        }
        if(total_bill){
            
            value['$set'].total_bill = total_bill;
        }
        if(phone_number){
            value['$set'].phone_number = phone_number;
        }
        value['$set'].modifiedAt = new Date();
        return await this.update(value);

    }

    async checkID(){
        const   
            query = {
                _id : new ObjectID(this.id)
            },
            client = await commonFun.find('clients', query)
        ;
       
        if(!client.length){
            this.assert(false,costantMessage.CLIENT_NOT_FOUND.message, costantMessage.CLIENT_NOT_FOUND.status)
        }
    }

    async update(value){
        
        const   
            query = {
                _id : new ObjectID(this.id)
            }
        ;
        await commonFun.updateOne('clients', query, value);

        return costantMessage.CLIENT_SUCCESSFULLY_UPDATED.message
    }
}

exports.getMAxBill = class extends API{

    async getMAxBill(){

        const  
            aggregate =[]
        ;
        aggregate.push(
                {
                   $group:{
                      _id:"$total_bill",
                      max_bill:{
                         $push:"$$ROOT"
                      }
                   }
                },
                {
                   $sort:{
                      _id:-1
                   }
                },
                {
                   $limit:1
                },
                {
                   $unwind:"$max_bill"
                },
                {
                   $lookup:{
                      from:"agency",
                      localField:"max_bill.agency_id",
                      foreignField:"_id",
                      as:"agency"
                   }
                },
                {
                   $unwind:"$agency"
                },
                {
                   $project:{
                      _id:0,
                      agentName:"$agency.name",
                      clientName:"$max_bill.name",
                      max_total_bill:"$_id"
                   }
                }
        )
       
        const data = commonFun.aggregate('clients', aggregate);

        if(data.length)
            return data
        
        return costantMessage.NO_RECORD_PRESENT.message
    }
}