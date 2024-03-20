import  express, { urlencoded }  from "express";
import  path  from "path";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import CookieParser from "cookie-parser";
import bcrypt from "bcrypt";
const app = express();
const port = 3000;

app.use(express.static(path.join(path.resolve(),"public")))
console.log(path.join(path.resolve(),"public"));
app.set('view engine','ejs')
app.use(express.urlencoded({extended:true}))
// app.use(express.static('public'))
app.use(CookieParser());
async function connectDb(){
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017",{dbName:"course"});
        console.log('Successful Connection');
    }catch(err){
        console.log('Error in connecting to DB');
    }
}
connectDb();

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    cpassword:String,
    address:String
})

const User = mongoose.model("User",userSchema);



const isAuth = async (req,res,next)=>{
    const{token} = req.cookies;

    try{
        if(token) {
            const decoded = jwt.verify(token,"swakshanisthebeast")
            req.User = await User.findById(decoded._id)
            next()
        }
        else res.redirect('/login')

    }catch(err){
        console.log('Error in token');
    }
}

app.get('/',(req,res)=>{
    res.render("main");
})
app.get('/register',(req,res)=>{
    res.render("register")
})
app.get('/login',(req,res)=>{
    res.render("login")
})
app.get('/dashboard',isAuth,(req,res)=>{
    res.render("dashboard",{name:req.User.name})
})
app.get('/logout',(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now())
    })
    res.redirect('/')
})

app.post('/login',async (req,res)=>{
    const {email,password} = req.body;


    const findEmail = await User.findOne({email});

    if(!findEmail) {
        return res.redirect('/register');
    }

    const passCheck = await bcrypt.compare(password,findEmail.password);

    if(!passCheck) {
        return res.render("login",{
            email,
            message:"Incorrect Password"});
    }

    const token = jwt.sign({_id:findEmail._id},"swakshanisthebeast")

    res.cookie("token",token,{
        httpOnly:true,
        expires: new Date(Date.now() + 60*100000)
    })
    res.redirect('/dashboard');
})

app.post('/register', async (req,res)=>{

    const {name,email,password,cpassword,address} = req.body;

    const hashedPass = await bcrypt.hash(password,10);

    const user = await User.create({
        name,
        email,
        password:hashedPass,
        cpassword,
        address})
    // console.log(name);
    console.log(req.body);

    // const token = jwt.sign({_id:user._id},"swakshanisthebeast")

    // res.cookie("token",token,{
    //     httpOnly:true,
    //     expires: new Date(Date.now() + 60*100000)
    // })
    res.redirect('/login');
})

app.listen(port,(req,res)=>{
    console.log(`the server is lisenning on port localhost:${port}`);
})