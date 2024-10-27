const express= require("express")
const http=require('http')
const { createServer } = require("http2")
const app= express()
const webpush=require('web-push')
require('dotenv').config();
const secret_key=process.env.SECRET_KEY
const bodyParser= require("body-parser")
const jwt= require("jsonwebtoken")
const cookieparser = require("cookie-parser")
app.use(cookieparser());
app.use(bodyParser.urlencoded({extended:true}))
const chatModel = require("./models/chat")
const server = http.createServer(app)
const socketio=require('socket.io');
const io=socketio(server)
const bcrypt= require('bcrypt')
const ejs= require("ejs")
const db = require("./config/config")
const userModel=require("./models/user");
const urlencoded = require("body-parser/lib/types/urlencoded");
const json = require("body-parser/lib/types/json");
app.set("view engine","ejs")
app.use(express.static('public'))
app.use(express.json());
const publicVapidKey="" // replace with your keys
const privateVapidKey="" // replace with your keys
const  auth =(req,res,next)=>
    {
        const tokenFromCookie= req.cookies.token
        try{
            if(tokenFromCookie)
            {
                const verification =jwt.verify(tokenFromCookie,secret_key)
                next()
            }
            else{
                res.redirect("/")
            }
        }catch(err){
            res.redirect("/")
        }
    
    }
    
app.post("/signup",async(req,res)=>
{
 const fname= req.body.fname
 const lname= req.body.lname
 const password= req.body.password
 const email=req.body.email

 
 if(!(fname && lname && email && password))
 {
     res.status(400).send("all field are required")
 }
 const exist = await userModel.findOne({Email:email})
 if(exist){
     res.status(401).send("user already exist")
 }
 else{
    const encpass= await bcrypt.hash(password,10)
    const user = await userModel.create({
        firstname:fname,
        lastname:lname,
        password:encpass,
        email:email
    })
  
 }
    

 res.redirect("/")
})


app.post("/login/api",(req,res)=>
{
    const token = req.cookies.token
    if(token)
    {   
        const isvalid = jwt.verify(token, secret_key);
        const id =isvalid.id
        return res.status(200).json({ token,id });
    }
    else{
        return res.status(200).json({undefined})    
    }
    
})


const checkLoginState = (req, res, next) => {
    const token = req.cookies.token;
    let loggedIn = false;

    if (token) {
        try {
            jwt.verify(token, secret_key); 
            loggedIn = true; 
        } catch (err) {
            res.redirect("/login"); 
        }
    }
    res.locals.loggedIn = loggedIn;

    next();
};

app.post("/login",async(req,res)=>
{
    const email= req.body.email
    const password= req.body.password
    const user = await userModel.findOne({email:email})
    
    if(user)
    {
        const passverify= await bcrypt.compare(password,user.password)
        if(passverify){
            const token = jwt.sign(
                {id:user._id,name:user.firstname},
                secret_key,
                {
                 expiresIn:'24h'
                }
            )
            const options={
                expires:new Date(Date.now()+24*60*60*1000),
                httpOnly:true
            };
            res.status(200).cookie("token",token,options)
            res.redirect("/")
        }
        else{
            res.status(400).send("password incorrect")
        }
    }
    else{
        res.status(400).send("user not  Available")
    }
})


app.get("/",checkLoginState,async(req,res)=>
{  
    const token = req.cookies.token
   
    try{
        
         if(token)
         {   
            verification = jwt.verify(token,secret_key)
            if(verification)
            {
                const users = await userModel.find(); 
                res.render("home",{user:users,id:verification.id})
            }
         }
         else{
            res.render("home")
         }
         

    }catch(err)
    {
      res.render("home")
    }
    
})


app.get("/login",(req,res)=>
{
    res.render("login")
})


app.get("/signup",(req,res)=>
{
    res.render("signup")
})

webpush.setVapidDetails("mailto:vaibhavsaxena599@gmail.com",publicVapidKey,privateVapidKey)

app.post("/subscribe", async (req, res) => {
 

  const subscription=req.body.sub
  const token=req.body.token

  try {
  
    const verification = jwt.verify(token, secret_key);
    const id = verification.id;

    const user = await userModel.findOne({ _id: id });

    if (user) {
      const users=await userModel.findOneAndUpdate(
        { _id: id },
        { subscription: subscription },
        { new: true }
      );
    } else {
      res.status(404).send("User not found.");
    }
  } catch (error) {
    console.error("Error in subscription:", error);
    res.status(400).send("Invalid token or server error.");
  }
});

io.on("connection", (socket) => {
    socket.on("token", async (token) => {
      try {
        if (token !== "undefined") {
          const isvalid = jwt.verify(token, secret_key);
  
          if (isvalid) {
            const id = isvalid.id;
            const status = "online";
            socket.join(id);
            socket.emit("online", status);
   
            
            socket.on("sendMessageToUser", async ({ userId, message }) => {
              console.log(userId)
              if (userId && message) {
                console.log(userId)
                app.post("/getNotification",async(req,res)=>
                {
                  const uid = req.body.uid
                  const user = await userModel.findOne({_id:uid})
                  const subofuser= user.subscription
                  console.log(uid)
                  payload=JSON.stringify({
                      data:user
                  })
                  await webpush.sendNotification(subofuser, payload)
                  .then(() => console.log("Push notification sent successfully."))
                  .catch(err => console.error("Error sending push notification:", err));
                })
                  
                socket.to(userId).emit("message", [message,id]);

                
                let chat = await chatModel.findOne({
                  $or: [
                    { senderId: id, receiverId: userId },
                    { senderId: userId, receiverId: id }
                  ]
                });
  
                if (chat) {
                  chat.message.push({
                    senderId: id,
                    receiverId: userId,
                    text: message,
                    timestamp: Date.now()
                  });
                  await chat.save();
                } else {
                  chat = await chatModel.create({
                    senderId: id,
                    receiverId: userId,
                    message: [
                      {
                        senderId: id,
                        receiverId: userId,
                        text: message,
                        timestamp: Date.now()
                      }
                    ]
                  });
                }
              }
            });

            socket.on('load chat', async (uid) => {   
                let loadchat = await chatModel.findOne({
                    $or: [
                      { senderId: id, receiverId: uid },
                      { senderId: uid, receiverId: id }
                    ]
                });
                if (loadchat) {
                    socket.emit("Load msg", loadchat.message);
                } else {
                    socket.emit("Load msg", "start chat");
                }
            });
            
          }
        }
      } catch (err) {
        socket.emit("offline", "offline");
      }
    });
});

  
app.get("/logout",async(req,res)=>
{
    const token=req.cookies.token
    if(token)
    { 
      const verification = jwt.verify(token, secret_key);
      const id = verification.id;
      const user = await userModel.findOne({ _id: id });
  
      if (user) {
        const users=await userModel.findOneAndUpdate(
          { _id: id },
          { subscription: null },
          { new: true }
        );
        res.cookie('token', token, { expires: new Date(0), httpOnly: true });
    }
    res.redirect("/")
}
})

server.listen(5000)



// https://fcm.googleapis.com/fcm/send/cpDqdoeLLRk:APA91bE8LPzfkYRVKdlluFxfgoNVtqd4TLMn2kt_kvvnmvxdxZ-YnfYPXX5nh5XBk-NNutxr0kmWO8XnnHePyy1cjEWG5pjm1YsZ421xHrPQqYtHjFH7Um1XWQnFUXmcOn74cnXbuYdi
// https://fcm.googleapis.com/fcm/send/cpDqdoeLLRk:APA91bE8LPzfkYRVKdlluFxfgoNVtqd4TLMn2kt_kvvnmvxdxZ-YnfYPXX5nh5XBk-NNutxr0kmWO8XnnHePyy1cjEWG5pjm1YsZ421xHrPQqYtHjFH7Um1XWQnFUXmcOn74cnXbuYdi
