const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
  
  console.log("🔑 Token received:", token ? "Yes" : "No");
  console.log("🔐 JWT_SECRET exists:", process.env.JWT_SECRET ? "Yes" : "No");
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("❌ JWT Error:", err.message);
      return res.sendStatus(403);
    }

    console.log("✅ User verified:", user);
    req.user = user;
    next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
  };
}

module.exports = { authenticateToken, requireRole };