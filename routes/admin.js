var express = require('express');
const {render}= require('../app')
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {

  let products=[
    {
      name:"iPhone 11",
      category:"Mobile",
      description:"This is a good phone",
      image:"https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone11-select-2019-family_GEO_EMEA?wid=882&hei=1058&fmt=jpeg&qlt=80&.v=1567022219953"
    },
    {
      name:"Redmi note 7",
      category:"Mobile",
      description:"This is a good phone",
      image:"https://i.gadgets360cdn.com/products/large/1551344291_635_redmi_note_7.jpg"
    },
    {
      name:"Realme 5 pro",
      category:"Mobile",
      description:"This is a good phone",
      image:"https://image01.realme.net/general/20210419/1618799076839.jpg"
    },
    {
      name:"Oneplus 6T",
      category:"Mobile",
      description:"This is a good phone",
      image:"https://i.gadgets360cdn.com/products/large/1544599845_635_oneplus_6t_mclaren_edition.jpg"
    }
  ]




  res.render('admin/view-products',{admin:true,products});
});
router.get('/add-product',function(req,res){
  res.render('admin/add-product')

})
router.post('/add-product',(req,res)=>{

  
  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.image
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render("admin/add-product")
      }
      else{
        console.log(err);
      }

    })
    
  })
})
module.exports = router;
