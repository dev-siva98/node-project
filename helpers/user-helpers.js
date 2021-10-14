var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((response) => {
                resolve(response)
            })
        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log('Login Success');
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('Login Failed');
                        resolve({ status: false })
                    }

                })
            } else {
                console.log('No user found');
                resolve({ status: false })
            }
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(userId), 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {

                            $push: { products: proObj }

                        }
                    ).then((response) => {
                        resolve()
                    }).then(() => {
                        resolve()
                    })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        quantity=parseInt(details.quantity)
        count=parseInt(details.count)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && quantity == 1) {
                
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then(() => {

                    resolve({ removeProduct: true })
                })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': count }
                    }).then(() => {
                        resolve({status:true})
                    })

            }
        })
    },
    removeItem: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
                {
                    $pull: { products: { item: objectId(details.product) } }
                }
            ).then((response) => {

                resolve(response)
            })
        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async(resolve, reject) => {
            cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart)
            {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $multiply:['$quantity','$product.price']
                                
                            }
                        }
                    }
                }
            ]).toArray()
            resolve(total[0].total)
        }
        else
        {
            resolve({total:'0'})
        }
        })
    },
    placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            let status=order.payment==='cod'?'placed':'pending'
            let orderObj={
                deliveryDetails:{
                address:order.address,
                pincode:order.pincode,
                mobile:order.mobile
                },
                userId:objectId(order.userId),
                payment:order.payment,
                products:products,
                total:total,
                status:status,
                date:new Date()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
                resolve(response.insertedId)
            })
        })
    },
    getCartProductList:(userId)=>{
        return new Promise(async (resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            resolve(cart.products)
        })
    },
   
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            orderId=objectId(orderId)
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(orderItems)
        })
    },
    getOrderDetails:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let details=await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
            resolve(details)
        })
    },
    getAllOrderProducts: (userId) => {

        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { userId: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(orderItems)
        })
    },
    // getPresentOrder:(orderId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let order=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
    //             resolve(order)
    //     })
    // },
    viewThisOrder: (order) => {
        return new Promise(async (resolve, reject) => {
            let orderId=objectId(order.orderId)
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            console.log(orderItems);
            console.log(orderItems._id);
            resolve(orderItems)
        })
    },
    getPresentOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let details = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $project: {
                        orderId:'$_id',
                        payment:'$payment',
                        total:'$total',
                        status:'$status',
                        date: { $dateToString: { format: "%w %Y-%m-%d %H:%M:%S", date: "$date" } },
                        delivery: '$deliveryDetails'
                    }
                },
            ]).toArray()
            console.log(details[0]);
            resolve(details[0])
        })
    }

}