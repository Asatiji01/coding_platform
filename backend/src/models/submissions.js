const mongoose =     require('mongoose');
const {Schema}=mongoose;

const SubmissonSchema = new Schema({

    userid:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
  },
    problemId: {
        type: Schema.Types.ObjectId,
    ref: 'Problem',
        required: true
  },
  code: {
        type: String,
        required: true
  },
  language: {
        type: String,
        required: true,
    enum: ['javascript', 'cpp', 'java'] 
  },
  status: {
        type: String,
    enum: ['pending', 'accepted', 'wrong', 'error'],
         default: 'pending'
  },
  runtime: {
        type: Number,  // milliseconds
         default: 0
  },
  memory: {
        type: Number,  // kB
         default: 0
  },
  errorMessage: {
        type: String,
         default: ''
  },
  testCasesPassed: {
        type: Number,
         default: 0
  },
  testCasesTotal: {  
        type: Number,
         default: 0
  }

},{
    timestamps:true
})

const submissions = mongoose.model('submit',SubmissonSchema);

module.exports=submissions