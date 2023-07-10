import express from 'express';
import { ForgotPassword, createUser, getUserbyId, getUsers, login, resetPassword, } from './userControllers.js';
import { PostQuestions, deleteQuestions, getQuestionById, updateQuesions } from '../quesions/questionController.js'
import { GetanswerByusername, createAnswer } from '../answer/answerController.js'
import auth from './middleware/auth.js'
import setNewPassWord from './Newpassword.js';
import correctPassword from './forgotpassowrd.js';
import OTP_confirming from './OTP.js';
const router = express.Router();

router.post('/', createUser);
router.get('/all', getUsers); //?to get all the user in the db
router.get('/',auth, getUserbyId)
router.post('/login', login)
router.post("/ForNewPassword", correctPassword);
router.post("/ForNewPasswordOTP", OTP_confirming);
router.post("/setNewPassword",  setNewPassWord);
router.delete("/questions/:id'",  deleteQuestions);
router.put("/questions/:id', '",  updateQuesions);
//?Post questions  
router.post("/questions", PostQuestions)
//* fetch questions
router.get('/questions', getQuestionById)
//? post answers
router.post('/answers/:questionId',createAnswer)

//** get answers from dv */
router.get('/answers/:id',GetanswerByusername)

router.post('/forgot_password',  ForgotPassword)
router.post('/reset/:token', auth, resetPassword)

export default router;



