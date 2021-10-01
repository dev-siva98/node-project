var db=require('../config/connection')
module.exports={

    addProduct:(product,callback)=>{
        db.get().collection('product').insertOne(product,function(err,data){
            callback(data.insertedId)

        })
    }



}