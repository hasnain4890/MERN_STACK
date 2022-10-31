const express = require("express");
const cors = require("cors");

require('./db/config');
const User = require("./db/User");
const Product = require("./db/Product");

const jwt = require('jsonwebtoken');
const jwtkey = 'e-comm';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/register', async(req,resp)=>{
    let user = new User(req.body);
    let result =await user.save();
    //dont show password
    result = result.toObject();
    delete result.password;
    
      jwt.sign({result},jwtkey,{expiresIn:"2h"},(err,token)=>{
            if(err){
                resp.send({result:"something went wrong"});
            }  
            resp.send({result,auth:token})
        })
})

app.post("/login", async(req,resp) =>{
    //console.log(req.body);
    
    if(req.body.password && req.body.email){

    let user = await User.findOne(req.body).select("-password");
    if(user){
        jwt.sign({user},jwtkey,{expiresIn:"2h"},(err,token)=>{
            if(err){
                resp.send({result:"something went wrong"});
            }
            resp.send({user,auth:token})
        })
         }
        else{
            resp.send({result:"No userss found"});
        }
    }else{
           resp.send({result:"No user found"});
      
    }
})

app.post("/add-product",async (req,resp) => {
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result)
})

app.get("/products",async(req,resp)=>{
    //console.log("nghgh");
    let products =await Product.find();
    if(products.length>0){
        resp.send(products)
    }else{
        resp.send({result:"No Products found"});
    }

})

app.delete("/product/:id",async(req,resp)=>{
 // resp.send(req.params.id);
 //console.log("hbfdghjg");
  const result =await Product.deleteOne({_id:req.params.id});
  resp.send(result)
})

app.get("/product/:id",async(req,resp)=>{
    let result = await Product.findOne({_id:req.params.id});
    if(result){
        resp.send(result)
    }else{
        resp.send({"result":"No record Found"})
    }
})
app.put("/product/:id",async(req,resp)=>{
    let result =await Product.updateOne(
        {_id:req.params.id},
        {$set:req.body}
    )
    resp.send(result);
})
app.get("/search/:key",async(req,resp)=>{
    let result = await Product.find({ 
        //"$or" is used when we search against multiple fields
        "$or":[
            { 
                name:{$regex: req.params.key}
                
            },
            {
                company:{$regex: req.params.key}
            }
        ]
    });
    resp.send(result);
})

app.listen(5000);
   