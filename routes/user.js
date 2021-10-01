var express = require('express');
var router = express.Router();

/* GET home page. */
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



  res.render('index', {products,admin:false});
});


module.exports = router;
