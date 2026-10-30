const redisClient = require("../config/redis");
const User =  require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission")

const cookieOptions = {
  maxAge: 60 * 60 * 1000,
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production'
};

const sendRegistrationError = (err, res) => {
    const duplicateFields = Object.keys(err.keyPattern || {});

    if (err.code === 11000) {
        // Keep operational evidence in server logs without exposing database
        // implementation details to the browser.
        console.error("Registration duplicate-key conflict", {
            keyNames: duplicateFields
        });

        if (duplicateFields.length === 1 && duplicateFields[0] === 'emailId') {
            return res.status(409).json({
                message: "An account with this email address already exists"
            });
        }

        return res.status(409).json({
            message: "Unable to create an account because of a data conflict"
        });
    }

    if (err.statusCode === 400 || err.name === 'ValidationError') {
        return res.status(400).json({
            message: err.message || "Registration failed"
        });
    }

    console.error("Registration failed", { code: err.code, name: err.name });
    return res.status(500).json({ message: "Registration failed" });
};


const register = async (req,res)=>{
    
    try{
        // validate the data;

      const {firstName, emailId, password} = req.body || {};
      validate({firstName, emailId, password});

      // Only accept the fields owned by public registration. In particular,
      // clients must not be able to provide roles or solved-problem data.
      const user = await User.create({
        firstName: firstName.trim(),
        emailId: emailId.trim().toLowerCase(),
        password: await bcrypt.hash(password, 10),
        role: 'user'
      });
     const token =  jwt.sign({_id:user._id , emailId:user.emailId, role:'user'},process.env.JWT_KEY,{expiresIn: 60*60});
     const reply = {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role:user.role,
    }
    
     res.cookie('token',token,cookieOptions);
     res.status(201).json({
        user:reply,
        message:"Loggin Successfully"
    })
    }
    catch (err) {
        return sendRegistrationError(err, res);
    }
    
}


const login = async (req,res)=>{

    try{
        const {emailId, password} = req.body;

        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({emailId});

        const match = await bcrypt.compare(password,user.password);

        if(!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role:user.role,
        }

        const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
        res.cookie('token',token,cookieOptions);
        res.status(201).json({
            user:reply,
            message:"Loggin Successfully"
        })
    }
    catch(err){
        res.status(401).send(err.message || "Invalid Credentials");
    }
}


// logOut feature

const logout = async(req,res)=>{

    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);


        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);
    //    Token add kar dung Redis ke blockList
    //    Cookies ko clear kar dena.....

    res.clearCookie('token', cookieOptions);
    res.send("Logged Out Succesfully");

    }
    catch(err){
       res.status(503).send("Error: "+err);
    }
}


const adminRegister = async(req,res)=>{
    try{
        // validate the data;
    //   if(req.result.role!='admin')
    //     throw new Error("Invalid Credentials");  
      validate(req.body); 
      const {firstName, emailId, password}  = req.body;

      req.body.password = await bcrypt.hash(password, 10);
    //
    
     const user =  await User.create(req.body);
     const token =  jwt.sign({_id:user._id , emailId:emailId, role:user.role},process.env.JWT_KEY,{expiresIn: 60*60});
     res.cookie('token',token,cookieOptions);
     res.status(201).json({
         message: "User Registered Successfully"
     });
    }
    catch(err){
        return sendRegistrationError(err, res);
    }
}

const deleteProfile = async(req,res)=>{
  
    try{
       const userId = req.result._id;
      
    // userSchema delete
    await User.findByIdAndDelete(userId);

    // Submission se bhi delete karo...
    
    // await Submission.deleteMany({userId});
    
    res.status(200).send("Deleted Successfully");

    }
    catch(err){
      
        res.status(500).send("Internal Server Error");
    }
}


module.exports = {register, login,logout,adminRegister,deleteProfile};
