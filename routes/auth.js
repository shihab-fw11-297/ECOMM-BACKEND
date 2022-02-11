const router = require("express").Router();
const User = require("../models/User");

//REGISTER with encypt hash password
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post('/login', async (req, res) => {
  //find by user id
  try{
      const user = await User.findOne(
          {
              userName: req.body.user_name
          }
      );

      !user && res.status(401).json("Wrong User Name");

      //get data from database and decrpt database password
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.PASS_SEC
    );

    //convert into string (using charecter we can define utf8)
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    const inputPassword = req.body.password;
    
    originalPassword != inputPassword && 
    res.status(401).json("Wrong Password");

    //verify by token
    const accessToken = jwt.sign(
      {
          id: user._id,
          isAdmin: user.isAdmin,
      },
      process.env.JWT,
          {expiresIn:"3d"}  //we cannot use this token after 3 days
      );

    //mogo store data in _doc
    const { password, ...others } = user._doc;  
        res.status(200).json({...others, accessToken});

    }catch(err){
        res.status(500).json(err);
    }

});
module.exports = router;