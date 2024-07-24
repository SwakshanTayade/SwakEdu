import  express, { urlencoded }  from "express";
import  path  from "path";
import CookieParser from "cookie-parser";
import router from "./routes/route.js";
import {config} from "dotenv";
import fileUpload from "express-fileupload";
export const app = express();
import cors from 'cors'

config({
    path:"./data/config.env"
})


const port = 3000;

app.use(express.static(path.join(path.resolve(),"public")))
app.use(cors({
    origin:[""],
    methods:["POST","GET"],
    credentials: true
}))
console.log(path.join(path.resolve(),"public"));
app.use(fileUpload({
    useTempFiles:true
}))
app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}))
app.use(express.json())
// app.use(express.static('public'))
app.use(CookieParser());

app.use(router);

export default app;




