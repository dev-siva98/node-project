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
  console.log('*****'+products);
})

router.get('/add-to-cart/:id',((req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })

}))

router.post('/change-product-quantity',async (req,res,next)=>{
  console.log(req.body);
  await userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    console.log(response);
    response.total=await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})

router.post('/remove-item',(req,res)=>{
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
  userHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
    res.json({status:true})

  })
})

module.exports = router;
