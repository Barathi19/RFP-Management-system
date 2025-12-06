require("dotenv").config();
const express = require("express");
const cors = require("cors");
const colors = require("colors");
const logger = require("./config/logger");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/database");
const routes = require("./routes");
colors.enable();

const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(logger);

routes(app);

app.get("/", (_, res) => res.send("Hello World!!!"));

app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`.cyan);
    });
  })
  .catch(console.error);
