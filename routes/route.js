import express, { urlencoded } from "express";
import { adminDashboard, deleteCard, followers, logout, mainPage, mentorLogin, mentorRegister, playVideo, search, showVideo, userDashboard, userLogin, userRegister } from "../controllers/user.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { mentorD } from "../models/mentor.js";
import { course } from "../models/admin.js";
import {v2 as cloudinary} from "cloudinary"
import { config } from "dotenv";
import path from "path";

config({
    path:path.resolve("../data/config.env")
})


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET, 
    secure:true,
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
router.get('/usersAndmentors',findToken,async(req,res)=>{

    const [rootUser, rootMentor] = await Promise.all([
        User.findById(req.User._id).exec(),
        mentorD.findById(req.User._id).exec()
    ])

    const userFilter = rootUser ? {_id:{$ne:rootUser._id}}:{}
    const mentorFilter = rootMentor ? {_id:{$ne:rootMentor._id}}:{}

    const [users,mentor] = await Promise.all([
        User.find(userFilter).exec(),
        mentorD.find(mentorFilter).exec()
    ])
    const {token,token2} = req.cookies; 
     
    res.render("usersAndmentors",{
        users,
        mentor,
        token,
        token2      
    })
     
})

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

    console.log("the id in people body is",id);
    try{
        const isFollowing = req.User.following.includes(id);
        await Promise.all([
            User.findByIdAndUpdate(req.User._id,{$addToSet:{following:id}}),
            User.findByIdAndUpdate(id,{$addToSet:{followers:req.User._id}}),
            mentorD.findByIdAndUpdate(req.User._id,{$addToSet:{following:id}}),
            mentorD.findByIdAndUpdate(id,{$addToSet:{followers:req.User._id}}),
        ])
        res.redirect('/usersAndmentors',{
            isFollowing,
        });
    }catch(err) {
        console.log("error");
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
                const user = await User.findById(id);
                user.url = result.url;
                await user.save();
                // await User.findByIdAndUpdate(id,{$set:{url:result.url}})
                res.redirect('userDashboard')
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

router.post('/createCourse',findToken,async(req,res)=>{
    const {courseName,insName,url,domain,des,videoLink} = req.body;
    const {token} = req.cookies;
    const {token2} = req.cookies;

    const videoLinkArr = videoLink.split(",").map(link=>link.trim())

    const createCourse = await course.create({
        courseName,
        insName,
        url,
        domain,
        des,
        videoLink:videoLinkArr,
    })
    
    
    // res.redirect("/")
    try{
        console.log("the root User",req.User);
        console.log("the course",createCourse._id);
        
        
        await mentorD.findByIdAndUpdate(req.User._id,{$addToSet:{createdCourses:createCourse._id}})
        const {name,email,address,following,followers,registeredCourses} = req.User;
        const user = await mentorD.findById(req.User._id).exec();
        const c = user.createdCourses;
        const courses = await course.find({_id:{$in:c}}).exec(); 
        res.render("adminDashboard",{
            name,
            email,
            address,
            followers:followers.length,
            following:following.length,
            courses,
            token2})
    }catch(err) {
        console.log("error",err);
    }
})


router.post('/login', userLogin)

router.post('/loginMentor', mentorLogin)

router.post('/register', userRegister)
router.post('/registerMentor', mentorRegister)

export default router;
