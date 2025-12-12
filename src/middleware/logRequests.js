//  middleware/logRequests.js

const pool = require("../config/database");
const logRequests = async (req, res, next) => {
  const { method, originalUrl, body } = req;
  const userId = req.user ? req.user.user_id : null; 

  
  let oldSend = res.send;
  res.send = async function (data) {
    try {
      await pool.query(
        `INSERT INTO api_logs 
        (endpoint, method, request_payload, response_payload, response_status, user_id)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [originalUrl, method, JSON.stringify(body), data, res.statusCode, userId]
      );
    } catch (err) {
      console.error('Error logging request:', err);
    }
    oldSend.apply(res, arguments);
  };

  next();
};

module.exports = logRequests;
