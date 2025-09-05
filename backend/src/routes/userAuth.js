const express= require('express');
const {register,login,logout,adminRegister} = require('../controllers/userAuthent');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const authRouter = express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',userMiddleware,logout);
authRouter.post('/admin/register',adminMiddleware,adminRegister);
// authRouter.post('/getprofile',getprofile);
// authRouter.post('/email',verifyemail)

module.exports=authRouter;