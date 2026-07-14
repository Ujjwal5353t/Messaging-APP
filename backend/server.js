import { server } from "./app.js";
import { connect } from "./db/connection.db.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8080;

connect().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});