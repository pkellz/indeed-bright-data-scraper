import * as mongoose from "mongoose";

const database = "indeed-listings";
const connectionString = `mongodb://127.0.0.1:27017/${database}`;

export const DatabaseService = {
  connect(callback: (callbackMessage?: string) => void) {
    mongoose
      .connect(connectionString)
      .then(() => {
        console.log("Database connection established");
        callback();
      })
      .catch((error) => {
        console.error({ message: "Failed to connect to database", error });
      });
  },
};
