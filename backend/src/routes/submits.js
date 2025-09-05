const express = require('express');
const submitcode=require('../controllers/usersubmission')
const userMiddleware = require('../middleware/userMiddleware');

const submitRouter = express.Router();

submitRouter.post('/submission/:id',userMiddleware,submitcode)

module.exports = submitRouter;