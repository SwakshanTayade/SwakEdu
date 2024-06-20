import { app } from "./index.js";
import { connectDb } from "./data/db.js";

connectDb();
const port  = 3000;

app.listen(port,(req,res)=>{
    console.log(`the server is lisenning on port localhost:${port}`);
})