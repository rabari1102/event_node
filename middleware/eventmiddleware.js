const db = require("../model/user");
const event = db.eventSchema;
const jwt = require("jsonwebtoken");
const jwtsec = "Pragnesh@1102";

const eventMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(400).json({ message: "invalid token" });
  }

  jwt.verify(
    token,
    "2e27795ccd65adad486e4337ece974497e349cd56c34af0ae83f99c920a80268",
    (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }

      const userId = decoded.userId;
      User.findById(userId, (err, user) => {
        if (err || !user) {
          return res.sendStatus(401).json({message:"Unauthorized"});
        }

        req.user = user;
        next();
      });
    }
  );
};

module.exports = eventMiddleware;
