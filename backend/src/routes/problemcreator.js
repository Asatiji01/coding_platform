const express= require('express');
const {problemCreate,problemDelete,problemUpdate,problemFetch,problemFetchAll}=require('../controllers/adminAuthent')
const adminMiddleware = require('../middleware/adminMiddleware')
const userMiddleware = require('../middleware/userMiddleware')
const problemRouter = express.Router();
//that routes for admin beacuse only admin can do that operation
problemRouter.post('/create',adminMiddleware,problemCreate);
problemRouter.patch('/update/:id',adminMiddleware,problemUpdate);
problemRouter.delete('/delete/:id',adminMiddleware,problemDelete);

problemRouter.get('/problembyid/:id',userMiddleware,problemFetch);
problemRouter.get('/getAllproblem',userMiddleware,problemFetchAll);
// problemRouter.get('solved',solvedproblem);
module.exports=problemRouter;