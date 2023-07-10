//** post quesions into db*/
import pool from "../../../server/config/database/db.js";
export const PostQuestions = (req, res) => {
    const { question, questionDescription, questionCodeBlock, tags, userId, post_id } =
      req.body;
  
    const questionsTable = `INSERT INTO questions (question, question_description, question_code_block, tags, user_id, post_id, time ) 
      VALUES (?, ?, ?, ?, ?, ? ,?)`;
    pool.query(
      questionsTable,
      [question, questionDescription, questionCodeBlock, tags, userId, post_id, new Date() ],
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error creating question");
        } else {
          const question_id= result.insertId; // get the auto-incremented question_id
          // console.log("Question created successfully with id:", question_id);
          res.status(201).json(result);
          // console.log(question_id);
        }
      }
    );
};
  
//** get all quesion from the database  and disply in the home page by the newest to the oldest */
export const  getQuestionById= (req, res) => {
 
    const sql = "SELECT questions.question_id, registrations.user_id, registrations.user_name, questions.question, questions.question_description, questions.time FROM questions LEFT OUTER JOIN registrations ON questions.user_id = registrations.user_id ORDER BY questions.time DESC";
  
    pool.query(sql, (err, result) => {
      if (err) {
        res.status(500).send({ error: "Error retrieving questions" });
      } else {
        // console.log("Questions:", result);
        // console.log("QuserId:");
        res.send(result);
      }
    });
  };
  
export const deleteQuestions=(req, res) => {
    const id = req.params.id;
    const query = `DELETE FROM questions WHERE question_id = ?`;
  
    db.query(query, id, (error, result) => {
      if (error) {
        res.status(500).json({ error });
        return;
      }
      res.status(200).json({ message: 'Question deleted.' });
    });
  }
  
export const updateQuesions=(req, res) => {
    const id = req.params.id;
    const { question, question_description } = req.body;
    const query = `UPDATE questions SET question = ?, question_description = ? WHERE question_id = ?`;
  
    db.query(query, [question, question_description, id], (error, result) => {
      if (error) {
        res.status(500).json({ error });
        return;
      }
      res.status(200).json({ message: 'Question updated.' });
    });
  };
  