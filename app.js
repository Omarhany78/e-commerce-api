require("express-async-errors");
require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const cors = require("cors");

const { authenticate } = require("./middlewares/authenticate");
const errorHanlder = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");
const connectDB = require("./db/connect");
const devRouter = require("./routes/devRouter");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/usersRouter");
const productRouter = require("./routes/productsRouter");
const cartRouter = require("./routes/cartsRouter");
const orderRouter = require("./routes/orderRouter");

app.use(cors({ origin: "http://localhost:5000", credentials: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

// app.use("/dev", devRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", authenticate, userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/carts", authenticate, cartRouter);
app.use("/api/v1/orders", authenticate, orderRouter);

app.use(notFound);
app.use(errorHanlder);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api-docs", (req, res) => {
  res.send("Swagger UI would be here.");
});

const start = async () => {
  await connectDB(process.env.MONGO_URI);
  app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
  });
};

start();
