const mongoose = require('mongoose');

const {Schema}= mongoose;
const userSchema = new Schema({
    firstname:{
        type:String,
        minlength:3,
        maxlength:12,
        required:true,
    },
    lastname:{
        type: String,
         minlength:3,
        maxlength:12,
    },
    emailid:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        immutable:true,
    },
    age:{
        type:Number,
        min:6,
        max:70,
    },
    role:{
      type:String,
      enum:['user','admin'],
      default:'user'
    },
    problemsolved:{
        type:[String]
    },
    password:{
       type:String,
       required:true, 
    }

},{
    timestamps:true
})
const User = mongoose.model('user',userSchema);
module.exports=User;