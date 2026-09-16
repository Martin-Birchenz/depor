require("dotenv").config();
const app = require("./src/app.js");
const pool = require("./src/config/db.js");

const PORT = process.env.PORT;

async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to the database");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
}

startServer();
