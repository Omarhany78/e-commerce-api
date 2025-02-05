const CustomError = require("../errors");

const authorize = (req, mainId) => {
  const { userId, role } = req.user;
  if (role === "admin") return;
  if (userId === mainId.toString() || userId === mainId._id.toString()) return;
  throw new CustomError.UnauthorizedError(
    "You aren't authorized to complete this process"
  );
};

module.exports = { authorize };
