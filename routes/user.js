const { response } = require('express');
var express = require('express');
const { Db } = require('mongodb');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
var userHelpers=require('../helpers/user-helpers')

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
  next()
  }
  else{
  res.redirect('/login')
  }
}
/* GET home page. */
router.get('/',async function(req, res, next) {

  let user=req.session.user
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products)=>{
    res.render('user/view-products',{products,user,cartCount});

  })

});
router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{

  res.render('user/login',{"loginErr":req.session.loginErr})
  req.session.loginErr=false
}
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    req.session.loggedIn=true
    req.session.user=req.body
    res.redirect('/')
  })
})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.loginErr="Invalid Username or Password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/login')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalAmount=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/cart',{products,user:req.session.user,totalAmount})
})

router.get('/add-to-cart/:id',((req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })

}))

router.post('/change-product-quantity',async (req,res,next)=>{
  console.log(req.body);
  await userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})

router.post('/remove-item',(req,res)=>{
  console.log(req.body);
  userHelpers.removeItem(req.body).then((response)=>{
    res.json(response)
  })
})

router.get('/place-order',verifyLogin,async (req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
    res.render('user/place-order',{total,user:req.session.user})
})
router.post('/place-order',async (req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    orderId=orderId.toString()
    if(req.body.payment=='COD'){
      res.json({codPayment:true,orderId})
    }
    else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((order)=>{
        res.json(order)
      })
    }
  })
})
router.get('/order-success/:id',async(req,res)=>{
  orderId=req.params.id
  let details=await userHelpers.getPresentOrder(orderId)
  console.log(details);
  userHelpers.getOrderProducts(orderId).then((order)=>{
    res.render('user/order-success',{user:req.session.user,order,details})
  })
  
})
router.get('/orders',(req,res)=>{
  userHelpers.getOrderDetails(req.session.user._id).then((order)=>{
  res.render('user/orders',{user:req.session.user,order})
})
})
router.post('/verify-payment',(req,res)=>{
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      let orderId=req.body['order[receipt]']
      console.log('Payment success');
      res.json({status:true,orderId})
    })
  }).catch((err)=>{
    res.json({status:false,errMsg:'Failed'})
  })
})

module.exports = router;
