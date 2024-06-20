import express, { urlencoded } from "express";
import { adminDashboard, createCourse, deleteCard, followers, logout, mainPage, mentorLogin, mentorRegister, playVideo, search, showVideo, userDashboard, userLogin, userRegister, usersAndmentors } from "../controllers/user.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { mentorD } from "../models/mentor.js";
import {v2 as cloudinary} from "cloudinary"
import fileUpload from "express-fileupload";
cloudinary.config({ 
    cloud_name: 'swakshan', 
    api_key: '291447395917276', 
    api_secret: 'ElUzqK00GSbEgPDnFjMZjDCY06E'
  });


const router = express.Router();

const isAuth = async (req,res,next)=>{
    const{token} = req.cookies;
    // console.log("the isAuth",token);

    try{
        if(token) {
            const decoded = jwt.verify(token,process.env.jwt_secret1)
            console.log(decoded);
            console.log(decoded._id);
            req.User = await User.findById(decoded._id)
            next()
        }
        else res.redirect('/login')

    }catch(err){
        console.log('Error in token');
    }
}

const adminAuth = async (req,res,next)=>{
    const {token2} = req.cookies;
    // console.log("the adminAuth:",token2);

    try{

        if(token2) {
            const decoded = jwt.verify(token2,process.env.jwt_secret2);
            req.User = await mentorD.findById(decoded._id)
            next() 
        }
        else res.redirect('/loginMentor')

    }catch(err){
        console.log("error in adminAuth");
        res.redirect('/')
    }

}

const findToken = async(req,res,next)=>{

    const {token,token2} = req.cookies;

    try{
        if(token||token2) {
            if(token) {
                const decoded = jwt.verify(token,process.env.jwt_secret1)
                req.User = await User.findById(decoded._id);
            }
            if(token2) {
                const decoded = jwt.verify(token2,process.env.jwt_secret2)
                req.User = await mentorD.findById(decoded._id);
            }
            next();
        }else res.redirect('/login')
    }catch(err) {
        console.log("err");
        res.redirect('/');
    }
}

router.get('/',mainPage)

router.get('/adminDashboard',adminAuth,adminDashboard)
router.get('/userDashboard',isAuth,userDashboard)

router.get('/followers',followers)
router.get('/usersAndmentors',findToken,usersAndmentors)

router.get('/register',(req,res)=>{
    res.render("register")
})
router.get('/registerMentor',(req,res)=>{
    res.render("registerMentor")
})
router.get('/login',(req,res)=>{
    res.render("login")
})
router.get('/loginMentor',(req,res)=>{
    res.render("loginMentor")
})
router.get('/adminPage',adminAuth,(req,res)=>{
    res.render("adminPage")
})
router.get('/logout',logout)
router.get('/showVideo',findToken,(req,res)=>{
    res.render("showVideo");
})

router.get("/search", search);
// router.post("/registerVideo",registerVideo)

router.post('/people', findToken,async(req,res)=>{

    const {id} = req.body;
    console.log("the body is",id);
    const people = await mentorD.findById(id);
    const people2 = await User.findById(id);
    console.log(req.User);
    if(people||people2) console.log("HO boi");
    else{
        res.redirect("/");
    }

    const temp = req.User._id;

    console.log(id,"===",temp);
    console.log(typeof(id));
    console.log(typeof(temp));
    if(temp == id) res.redirect('/');
    else {
        await User.findByIdAndUpdate(req.User._id,{$addToSet:{following:id}})
    res.redirect('/usersAndmentors');
    }
})

router.post("/registerVideo",isAuth,async(req,res)=>{
    const {registerVideo} = req.body;
    const userId = req.User._id;

    console.log("the video id is: " ,registerVideo);
    console.log("the user id is: " ,userId);
    
    await User.findByIdAndUpdate(userId,{$addToSet:{registeredCourses:registerVideo}});

    res.redirect("/");
})

router.post('/playVideo',playVideo)

router.post("/userDashboard",isAuth,async(req,res)=>{

    try {
            const file = req.files.url;
            const {token} = req.cookies;
            console.log("the file is: ",file);
            console.log(req.params);
            console.log("the userDash is: ",req.body);
            const {url} = req.body;
            console.log("the req.user is :",req.User);
            const {name,email,address} = req.User;
            const id = req.User._id;
            console.log(id);
            cloudinary.uploader.upload(file.tempFilePath,async (err,result)=>{
                console.log("the result: ",result);
                const user = await User.findById(id);
                console.log("the type of result:",typeof(result.url));
                console.log("the id of user:",id);
                user.url = result.url;
                await user.save();
                res.render("userDashboard",{
                    url:result.url,
                    token,
                    name,
                    email,
                    address
                })
            })
    } catch (error) {
        console.log("error in uploading image");
        res.redirect("/userDashboard")
    }


})

router.post('/adminDashboard',adminAuth,async(req,res)=>{
    try{
        const {token2} =  req.cookies;
        console.log(token2);
        const file = req.files.url;
        const id = req.User._id;
        const {name,email,address} = req.User;
        cloudinary.uploader.upload(file.tempFilePath,async(err,result)=>{

            console.log("the resukt:",result);
            console.log("the user:",req.User);
            const mentor = await mentorD.findById(id);

            mentor.url = result.url;

            await mentor.save();

            res.render("adminDashboard",{
                token2,
                name,
                email,
                address,
                url:result.url
            })
        })

    }catch(err) {
        console.log("error in uploading image");
        res.redirect("/adminDashboard");
    }
})

router.post('/deleteCard', deleteCard)

router.post('/showVideo',findToken, showVideo)

router.post('/createCourse',createCourse)


router.post('/login', userLogin)

router.post('/loginMentor', mentorLogin)

router.post('/register', userRegister)
router.post('/registerMentor', mentorRegister)

export default router;
