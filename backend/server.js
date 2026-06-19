import app from "./app.js";
import dotenv from "dotenv"

dotenv.config({
    path : "./.env"
});


import {connect} from "./db/connection.db.js"

await connect();

app.listen(process.env.PORT || 8000 , () => {
    console.log(`server started on port ${process.env.PORT}`);
});
