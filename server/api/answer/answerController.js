
import pool from "../../../server/config/database/db.js";
export const createAnswer = (req, res) => {
  
    const {answer, userId,answerCodeBlock,questionId} = req.body;
    const insertAnswer = `INSERT INTO answers (answer, answer_code_block, user_id, question_id, time)
   VALUES( ?, ?, ?,? ,?)`;
    pool.query(insertAnswer, [answer, answerCodeBlock, userId, questionId, new Date()], (answerError, answerResult) => {
      if (answerError) {
        console.error('Error creating answer:', answerError);
        res.status(500).send('Error creating answer');
      } else {
        const answerId = answerResult.insertId; 
        console.log('Answer created:', answerId);
        
        console.log(`quesionId is`, questionId);
        res.sendStatus(200);
      }
    });
  };
  

//** get answers by user name */
export const GetanswerByusername = (req, res) => {
    pool.query(
      `SELECT q.question_id, q.question, q.question_description, q.time AS question_time,
      a.answer_id, a.answer, a.time AS answer_time,
      r.user_name AS user_name
    FROM questions q
    JOIN answers a ON q.question_id = a.question_id
    JOIN registrations r ON a.user_id = r.user_id
    ORDER BY a.time DESC; `,
   (err, results) => {
        if (err) {
          throw err;
        }
        console.log(`Fetching answers for question by username`);
        res.json(results);
      }
    );
  };
  
    