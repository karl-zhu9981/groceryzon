const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var cookieGen = require('./cookieGen');
const cookieParser = require('cookie-parser');
const sgMail = require('@sendgrid/mail');
var QRcode = require('qrcode');
const multer = require('multer');
const path = require('path');
sgMail.setApiKey("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");





// all i could get done during the weekend 

// connecting to db
mongoose.connect('mongodb://localhost:27017', {useNewUrlParser:true,useUnifiedTopology:true} ,function(){
    console.log('connected to db');
});

// mongoose Schema

// defining schema
const PostSchema = mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    sessionid:{
        type:String,
        required:true
    },
    addressOne:{
        type:String,
        required:true
    },
    addressTwo:{
        type:String,
        required:false
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    zipCode:{
        type:String,
        required:true
    },
    ip:{
        type:String,
        required:false
    },
    
});

// defining schema for CC
const PostSchemaA = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    hourlyCapacity:{
        type:Number,
        required:true
    },
    owner:{
        type:String,
        required:true
    },
    id:{
        type:String,
        required:true
    },
    
});

// defining schema for qrcodes
const PostSchemaB = mongoose.Schema({
    randomCode:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    timeIn:{
        type:String,
        required:true
    },
    timeOut:{
        type:String,
        required:true
    },
    
});
const Post = mongoose.model('Registration', PostSchema);
const PostA = mongoose.model('shop', PostSchemaA);
const PostB = mongoose.model('qrcode', PostSchemaB);

app.use(express.static(__dirname + "/front-end"));
app.use(bodyParser.json());
app.use(cookieParser());


app.get('/', function(req,res){
    res.sendFile(__dirname + "/front-end/index.html");
});


app.get('/shop', function(req,res){
    res.sendFile(__dirname + "/front-end/shop.html");
});


app.get('/features', function(req,res){
    res.sendFile(__dirname + "/front-end/features.html");
});

app.get('/thanks', function(req,res){
    res.sendFile(__dirname + "/front-end/thanks.html");
});

app.get('/becomeVendor', function(req,res){
    res.sendFile(__dirname + "/front-end/becomeVendor.html");
});


app.get('/retailer/panel', function(req,res){
    Post.exists({sessionid:req.cookies.sessionid}, function(err,response){
        if(!err){
            if(response == true){
                res.sendFile(__dirname + "/front-end/panel.html");
            }else{
                res.redirect("/retailer/login");
            }
        }
    })
});

app.get('/retailer/myAccount', function(req,res){
    Post.exists({sessionid:req.cookies.sessionid}, function(err,response){
        if(!err){
            if(response == true){
                res.sendFile(__dirname + "/front-end/myAccount.html");
            }else{
                res.redirect("/retailer/login");
            }
        }
    })
});

app.get('/retailer/myShop', function(req,res){
    Post.exists({sessionid:req.cookies.sessionid}, function(err,response){
        if(!err){
            if(response == true){
                res.sendFile(__dirname + "/front-end/myShop.html");
            }else{
                res.redirect("/retailer/login");
            }
        }
    })
});

app.get('/retailer/login', function(req,res){
    Post.exists({sessionid:req.cookies.sessionid}, function(err,response){
        if(!err){
            if(response == true){
                res.redirect("/retailer/panel");
            }else{
                res.sendFile(__dirname + "/front-end/login.html");
            }
        }
    })
});

app.get('/credits', function(req,res){
    res.sendFile(__dirname + "/front-end/credits.html");
});

app.get('/time', function(req,res){
    res.sendFile(__dirname + "/front-end/time.html");
});


// api to create account
app.post("/api/createAccount", function(req,res){
    if(req.body.email.length == 0 || req.body.password.length == 0 || req.body.addressOne.length == 0 || req.body.city.length == 0 || req.body.state.length == 0 || req.body.zipCode.length == 0){
        res.status(400).send(JSON.stringify({error:"Please do not leave any fields empty"}));
    }
    else{
        Post.exists({email:req.body.email}, function(err,msg){
            if(msg == true){
                res.status(400).send(JSON.stringify({error:"Email is already registrated"}));
            }else{
                var sessionid = cookieGen.generateCookie();
                bcrypt.hash(req.body.password,10, function(err,hash){
                    var post = new Post({
                        email:req.body.email,
                        password:hash,
                        sessionid: sessionid,
                        ip: req.ip || req.ips || req.connection.remoteAddress,
                        addressOne:req.body.addressOne,
                        addressTwo:req.body.addressTwo,
                        city:req.body.city,
                        state:req.body.state,
                        zipCode:req.body.zipCode
                    });
                    post.save();
                    res.cookie("sessionid",sessionid).status(201).send(JSON.stringify({message:"Successfully created account!"}));
                    sgMail.setApiKey("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");
                    const msg = {
                    to: req.body.email,
                    from: 'admin@groceryzon.ca',
                    subject: 'Groceryzon - Thanks for joining us!',
                    //text: 'and easy to do anywhere, even with Node.js',
                    html: 'Please log into your account here - https://groceryzon.ca/retailer/login',
                    };
                    sgMail.send(msg);
                })
            }
        });
    }
});



// api to create a shop for a specific user 
app.post("/api/createShop",  function(req,res){
    upload(req,res,(err) => {
        if(!err){
            console.log(req.file);
        }
    })
    if(req.body.name == null || req.body.capacityHour == null || req.body.photo == null){
        res.status(400).send(JSON.stringify({error:"Missing inputs"}));
    }else{
        Post.findOne({sessionid:req.cookies.sessionid}, 'email', function(err,response){
            if(!err || response != null){
                var postA = new PostA({
                    name:req.body.name,
                    image:"feature not working yet",
                    hourlyCapacity:req.body.capacityHour,
                    owner:response.email,
                    id:cookieGen.generateCookie()
                });
                postA.save();
                res.status(201).send(JSON.stringify({msg:"Successfully created the shop!"}))
            }else{
                res.status(401).send(JSON.stringify({error:"You're not logged."}));
            }
        })
    }
});

// api to iterate through all someone shop's from his session id cookie
app.get("/api/getYourShops", function(req,res){
    Post.findOne({sessionid:req.cookies.sessionid}, function(err,response){
        if(!err || response != null){ // if no errors , and if we find the cookie
            PostA.find({owner:response.email},"name" ,function(err,resp){
                var someArray = [];
                for(var i = 0 ; i < resp.length; i++){
                    someArray.push(resp[i].name);
                }
                res.status(200).send(JSON.stringify({Shops:someArray}));
            })
        }else{
            res.status(401).send(JSON.stringify({error:"You're not logged."}));
        }
    })
});


// api for logging in
app.post('/api/login', function(req,res){
    Post.findOne({email:req.body.email}, function(err,response){
        if(response == null){
            res.status(404).send(JSON.stringify({error:"Email does not exist"}));
        }else if(req.body.email == response.email){
            bcrypt.compare(req.body.password,response.password, function(err,msg){
                if(msg == true){
                    var sessionid = cookieGen.generateCookie();
                    response.overwrite({email:req.body.email,password:response.password,sessionid:sessionid, ip:response.ip, addressOne:response.addressOne,addressTwo:response.addressTwo,city:response.city,state:response.state,zipCode:response.zipCode});
                    response.save();
                    res.cookie("sessionid", sessionid).status(200).send(JSON.stringify({message:"Good credentials"}));
                }else{
                    res.status(400).send(JSON.stringify({error:"Wrong credentials"}));
                }
            })
        }
    })
});



// api for requesting to come at a specific store
app.post("/api/requestStore", function(req,res){
    if(req.body.email.length != 0 || req.body.timeIn.length != 0 || req.body.timeOut.length != 0 || req.body.adults.length !=0 || req.body.children.length !=0){
        var randomCode = cookieGen.generateCookie();
        QRcode.toDataURL("https://groceryzon.ca/retailer/" + randomCode, function(err,qrcodebase64){
            var position = qrcodebase64.indexOf(',');
            var base64attachment = qrcodebase64.substring(position+1);
            var postB = new PostB({
                randomCode:randomCode,
                address:"1000 Anywhere St, Montreal, QC",
                timeIn:req.body.timeIn,
                timeOut:req.body.timeOut,
            });
            postB.save();
            sgMail.setApiKey("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");
                    const msg = {
                    to: req.body.email,
                    from: 'admin@groceryzon.ca',
                    subject: 'Groceryzon - Thanks for using our service',
                    //text: 'and easy to do anywhere, even with Node.js',
                    html: 'You are ready to go for ' + req.body.timeIn + ' to ' + req.body.timeOut + "<html> <body> <img src=\"cid:myimagecid\"/> </body> </html>" + "Thank you for coming onto our initiative to flatten the curve!",
                    attachments: [
                        {
                          content: base64attachment,
                          filename: "qrcode.png",
                          type: "png",
                          disposition: "attachment"
                        }
                      ]
                    };
                    sgMail.send(msg);
                    res.status(200).send(JSON.stringify({message:"Successfully sent QRCODE"}));
        })
    }else{
        res.status(400).send(JSON.stringify({error:"wrong/empty inputs"}));
    }
});

// endpoint to gives result after scanning the qrcode
app.get('/retailer/:Code', function(req,res){
    Post.exists({sessionid:req.cookies.sessionid}, function(err,response){
        if(!err){
            if(response == true){
                res.sendFile(__dirname + "/front-end/myAccount.html");
            }else{
                res.redirect("/retailer/login");
            }
        }
    })
});


// used on /vendor/:code to submit information through a javascript call.
app.post('/api/getUserInfo', function(req,res){
    console.log(req.body.randomCode);
    PostB.findOne({randomCode:req.body.randomCode}, function(err,resp){
        console.log(resp);
        if(resp !== null){
            console.log(resp);
            res.status(200).send(JSON.stringify({address:resp.address,timeIn:resp.timeIn,timeOut:resp.timeOut}));
        }else{
            res.status(404).send(JSON.stringify({error:"could not be found!"}));
        }
    })
});


app.listen(5000);