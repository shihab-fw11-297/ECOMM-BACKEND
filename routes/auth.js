const User = require("../models/User.js");
const router = require('express').Router();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
    const newUser = new User({
        fname: req.body.fname,
        lname: req.body.lname,
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC
          ).toString(),
        address: req.body.address
      });
    
      try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
      } catch (err) {
        res.status(500).json(err);
      }
})

//Login

router.post("/login", async (req, res) => {
    //find by user id
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(404).json({
          message: "Username is not found. Invalid login credentials.",
          success: false
        });
      }
  
  
      //get data from database and decrpt database password
  
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.PASS_SEC
      );
  
      //convert into string (using charecter we can define utf8)
      const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
  
      if(OriginalPassword !== req.body.password){
        return res.status(404).json({
          message: "password is not match, Invalid login credentials.",
          success: false
        });
      }
  
      //verify by token
      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
       process.env.JWT_SEC,
       { expiresIn: "3d" }  //we cannot use this token after 3 days
     );
  
  
      //send data without password
     const { password,cpassword, ...others } = user._doc;
  
      res.status(200).json({ ...others, accessToken });
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router
