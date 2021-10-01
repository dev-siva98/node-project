var db=require('../config/connection')
module.exports={

    addProduct:(product,callback)=>{
        db.get().collection('product').insertOne(product).then((data)=>{
            callback(data.insertedId)

        })
    },
    getAllProducts:()=>{
        return new Promise((resolve,reject)=>{
            let products=db.get().collection()
        })
    }



}