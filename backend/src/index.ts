import { AppDataSource } from "./config/data-source";
import app from "./app";

AppDataSource.initialize()
  .then(() => {
    console.log("DB connected ✅");
    app.listen(4000, () => {
      console.log("Server running on http://localhost:4000");
    });
  })
  .catch((err) => console.error("DB connection failed ❌", err));
