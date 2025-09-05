const Problems = require('../models/problem')
const submitcode = async(req,res)=>{

  try{
   const userid = req.result._id;
   const proid =  req.params;

   const {code,language} = req.body
   if(!userid||!proid||!code||!language)
    return res.status(400).send('some fields missing')

  // problem fetch from database 
      const problem = await Problems.findById(proid)
      
  }
  catch(err)
  {
    res.status(400).send('falied to fetch solved problems ')
  }

}

module.exports = submitcode;
