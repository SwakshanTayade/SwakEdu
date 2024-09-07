import { course } from "../models/admin.js";
import { mentorD } from "../models/mentor.js";
import {User} from "../models/user.js";
import jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";



export const mainPage = async (req,res)=>{
    const {token} = req.cookies;
    const {token2} = req.cookies;

    try{
        const courses = await course.find({}).exec();

        res.render("main",{
            courses:courses,
            token,
            token2})

    }catch(err) {
        console.log("error");
    }

} 

export const followers = async(req,res)=>{
    res.render('followers')
}


export const userDashboard = async(req,res)=>{
    
    const {token} = req.cookies;

    const {name,email,address,url,followers,following} = req.User;
    const registeredCourses = req.User.registeredCourses.map(course => course._id);

    
        
    const allcourses = await course.find({_id:{$in:registeredCourses}}).exec();
    res.render("userDashboard",{
        token,
        name,
        email,
        address,
        url,
        allcourses,
        following:following.length,
        followers:followers.length
    })
}
export const adminDashboard = async(req,res)=>{

    const {token2} = req.cookies;
    const {name,email,address,url,followers,following} = req.User;
    const registeredCourses = req.User.createdCourses.map(course=>course._id);

    const courses = await course.find({_id:{$in:registeredCourses}}).exec();
    res.render('adminDashboard',{
        token2,
        name,
        email,
        address,
        url,
        courses,
        followers:followers.length,
        following:following.length
    });

}
export const logout = (req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now())
    })
    res.cookie("token2",null,{
        httpOnly:true,
        expires:new Date(Date.now())
    })
    res.redirect('/')
}

export const search = async (req, res) => {
    const searchQuery = req.query.query;
    const {token} = req.cookies;
    const {token2} = req.cookies;
    try {
        const courses = await course.find({
            $or: [
                { courseName: { $regex: searchQuery, $options: "i" } },
                { insName: { $regex: searchQuery, $options: "i" } },
                { url: { $regex: searchQuery, $options: "i" } },
                { domain: { $regex: searchQuery, $options: "i" } },
                { des: { $regex: searchQuery, $options: "i" } },
                { videoLink: { $regex: searchQuery, $options: "i" } },
            ],
        });

        return res.status(200).render("main", {
            courses,
            token,
            token2    
        });
    } catch (error) {
        console.error("Error fetching search results:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteCard = async (req,res)=>{

    const {id} = req.body;
    await Promise.all([
        course.findByIdAndDelete({_id:id}),
        mentorD.updateMany(
            { createdCourses: id },  // Find all mentors having this course ID
            { $pull: { createdCourses: id } } // Remove the ID from the 'createdCourses' array
        )
    ]) 
    
    
    res.redirect('/');
}
let videArr = [];
export const showVideo = (req,res)=>{

        const {videoLink} = req.body;
        const {token,token2} = req.cookies;
        videArr = videoLink.split(",").map(link=>link.trim());

        // console.log(typeof(videArr));
        // console.log(videArr);
        console.log(token);
        console.log("the user is:",req.User);

        const{name} = req.User;
        if(!videoLink) {
            res.redirect("/");
        }
        // console.log(videoLink);
            res.render("showVideo",{
                videArr,
                token,
                token2,
                name
            })
}

export const playVideo = (req,res)=>{
    
    try{
        const {link} = req.body;
    const {token,token2} = req.cookies;
    console.log("The links are: ",videArr);
    console.log("The link is: ",link);

    res.render("showVideo",{
        videArr,
        link,
        token,
        token2
    })
    }catch(err) {
        res.redirect('/')
    }
}



export const userLogin = async (req,res)=>{
    const {email,password} = req.body;


    try{
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

    const token = jwt.sign({_id:findEmail._id},process.env.jwt_secret1)
    console.log("user token: ",token);
    //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjBiN2U4ZWIwMTkxZTVjZjhkY2E0NjUiLCJpYXQiOjE3MTIwMzE3Njh9.mGLXOu8MuOyae7Lbu2gID-JQicRB-VmyZ5X9MLuqsbo

    if(req.cookies.token2) {
        res.clearCookie('token2')
    }
    res.cookie("token",token,{
        httpOnly:true,
        expires: new Date(Date.now() + 60*100000)
    })
    res.redirect('/userDashboard');
    }catch(err) {
        console.log("err");
        res.redirect("/");
    }
}

export const mentorLogin = async(req,res)=>{

    try{
        const {email,password} = req.body;

    const findEmail = await mentorD.findOne({email});

    if(!findEmail) {
        return res.redirect('/register');
    }

    const passCheck = await bcrypt.compare(password,findEmail.password);

    if(!passCheck) {
        return res.render("loginMentor",{
            email,
            message:"Incorrect Password"
        })
    }
    const token2 = jwt.sign({_id:findEmail._id},process.env.jwt_secret2)
    console.log("mentor token: ",token2);
    //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjA5MWIxYjYzM2RmNGNjZDQxOGJkMzAiLCJpYXQiOjE3MTIwMzE4MDd9.4-xY7Pre5i_7Db8CATb2M48ZrMfjlpo0rt1E9A7GP4w

    if(req.cookies.token) {
        res.clearCookie('token');
    }

    res.cookie("token2",token2,{
        httpOnly:true,
        expires: new Date(Date.now() + 60*100000)
    })
    res.redirect("/adminPage")
    }catch(err) {
        res.redirect('/loginMentor');
    }
}

export const userRegister = async (req,res)=>{
    try{
        const {name,email,password,cpassword,address,url} = req.body;

    const findEmail = await User.findOne({email});
    const findName = await User.findOne({name});

    if(findName) {
        return res.render("register",{
            name
        })
    }
    else if(findEmail) {
        return res.render("register",{
            email
        })
    }

    const hashedPass = await bcrypt.hash(password,10);

    const user = await User.create({
        name,
        email,
        password:hashedPass,
        cpassword,
        address,
        url})
    // console.log(name);
    console.log(req.body);

    // const token = jwt.sign({_id:user._id},"swakshanisthebeast")

    // res.cookie("token",token,{
    //     httpOnly:true,
    //     expires: new Date(Date.now() + 60*100000)
    // })
    res.redirect('/login');
    }catch(err) {
        res.redirect('/register');
    }
    
}

export const mentorRegister = async(req,res)=>{

    try{
        const {name,email,password,cpassword,address} = req.body;

    const findEmail = await mentorD.findOne({email});
    const findName = await mentorD.findOne({name});

    if(findName) {
        return res.render("registerMentor",{
            name
        })
    }
    else if(findEmail) {
        return res.render("registerMentor",{
            email
        })
    }
    const hashedPass = await bcrypt.hash(password,10);

    const mentor = await mentorD.create({
        name,
        email,
        password:hashedPass,
        cpassword,
        address
    })
    res.redirect('/loginMentor');
    }catch(err) {
        res.redirect('/registerMentor');
    }

}