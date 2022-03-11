//framework or library for create server
const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER with encypt hash password
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
    cpassword: CryptoJS.AES.encrypt(
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
});

//LOGIN

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


    //mogodb store data in _doc
    const { password, ...others } = user._doc;

    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;