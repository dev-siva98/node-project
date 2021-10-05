var db=require('../config/connection')
var collection=require('../config/collections')
var objectId=require('mongodb').ObjectId
module.exports={

    addProduct:(product,callback)=>{
        let proDetail={
            pname:product.pname,
            category:product.category,
            description:product.description,
            price:parseInt(product.price)

        }
        db.get().collection('product').insertOne(proDetail).then((data)=>{
            callback(data.insertedId)

        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).remove({_id:objectId(proId)}).then((response)=>{
                resolve(response)
                console.log(response);
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
            resolve(product)
    })
})

},
updateProduct:(proId,proDetails)=>{
    return new Promise(async(resolve,reject)=>{
       await db.get().collection(collection.PRODUCT_COLLECTION)
        .updateOne({_id:objectId(proId)},{
            $set:{
                pname:proDetails.pname,
                category:proDetails.category,
                description:proDetails.description,
                price:parseInt(proDetails.price)
                
            }
        }).then((response)=>{
            resolve()
        })
    })
}


}