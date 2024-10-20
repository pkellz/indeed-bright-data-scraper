require("dotenv").config();
import { router } from "./routes";
import * as express from "express";
import { DatabaseService } from "./DatabaseService";

const port = 3002;
const app = express();

app.use(express.json());
app.use("/", router);

// Initiate database connection and start the server
DatabaseService.connect(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
