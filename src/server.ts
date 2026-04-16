import app from "./app";
import dotenv from "dotenv";


dotenv.config();


app.listen(process.env.PORT || 3000 , ()=>{
    console.log(`Server is live at http://localhost:${process.env.PORT}`);
})