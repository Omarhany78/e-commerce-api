const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CustomError = require("../errors");
const crypto = require("crypto");

// Enum for user roles
const userRoles = {
  ADMIN: "admin",
  CUSTOMER: "customer",
  SELLER: "seller",
};

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide your first name"],
      maxLength: [50, "First name must be less than 50 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Please provide your last name"],
      maxLength: [50, "Last name must be less than 50 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email address"],
      unique: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      match: [
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must be at least 8 characters long and contain both letters and numbers",
      ],
    },
    role: {
      type: String,
      enum: {
        values: Object.values(userRoles),
        message: "Role must be either 'admin' or 'customer'",
      },
      default: userRoles.CUSTOMER,
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide your phone number"],
      match: [
        /^[0-9]{10,15}$/,
        "Phone number must be between 10 and 15 digits and contain only numbers",
      ],
    },
    money: {
      type: Number,
      default: 1000000,
    },
    orderHistory: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
          required: [true, "Order ID is required"],
        },
        status: {
          type: String,
          enum: {
            values: ["Pending", "Shipped", "Delivered", "Cancelled"],
            message:
              "Status must be one of 'Pending', 'Shipped', 'Delivered', or 'Cancelled'",
          },
          default: "Pending",
        },
        totalPrice: {
          type: Number,
          required: [true, "Total price is required"],
          min: [0, "Total price must be at least 0"],
        },
        datePlaced: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.statics.createUser = async function (req) {
  const { firstName, lastName, email, password, phoneNumber } = req.body;
  if (!firstName || !lastName || !email || !password || !phoneNumber) {
    throw new CustomError.BadRequestError("Please provide all required fields");
  }

  const user = await this.create({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
  });

  return user;
};

userSchema.methods.createToken = function () {
  const payload = { userId: this._id, role: this.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

userSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  if (!isMatch) {
    throw new CustomError.UnauthorizedError("Wrong password provided");
  }
  return isMatch;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  console.log(`resetToken: ${resetToken}`);
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log(`resetPasswordToken: ${this.resetPasswordToken}`);
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
