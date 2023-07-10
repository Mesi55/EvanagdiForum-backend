import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import pool from './server/config/database/db.js';
import userRouter from './server/api/users/userRouter.js';
import auth from './server/api/users/middleware/auth.js';
dotenv.config();
const app = express();
const port = process.env.PORT ;
// ||80
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// app.use("/user",auth, userRouter);
app.use("/user", userRouter)
app.use("/user/setNewPassword", userRouter);
app.use("/user/ForNewPassword", userRouter);
app.use("/user/answers", userRouter);
app.use('/user/questions', userRouter)
app.use('/username', userRouter)
app.use('/username/id', userRouter)
app.use('/questions', userRouter)
app.use('/questions/:id', userRouter)

 

// app.use(cors({
//   origin: 'https://evangadiforum-frontend.pages.dev/',
// }));
  //? Start the server
  
app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));
// app.listen(port,'0.0.0.0', () => console.log(`Server listening on port http://localhost:${port}`));





