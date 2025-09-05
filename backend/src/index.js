const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const express = require('express');
const main = require('./config/db');
const authRouter =require('./routes/userAuth')
const problemRouter = require('./routes/problemcreator')
const submitRouter = require('./routes/submits')
const app =express();
const cookieParser=require('cookie-parser');
const redisclient = require('./config/redis');


app.use(express.json());
app.use(cookieParser());

app.use("/user",authRouter)
app.use('/admin',problemRouter)
app.use('/submit',submitRouter)
const initaliseconnection = async()=>{
   try{
      await Promise.all([main(), redisclient.connect()]);
      console.log("db connected");
       app.listen(process.env.PORT,()=>{
   console.log("server listening at port "+ process.env.PORT)
})
   }catch(err)
   {
            console.error("Error while connecting:", err.message);
   }
}

initaliseconnection();
// main()
// .then(async ()=>{
//     console.log("Connected to database");
//    app.listen(process.env.PORT,()=>{
//    console.log("server listening at port "+ process.env.PORT)
// })
// })
// .catch(err=> console.log("error is "+ err))
