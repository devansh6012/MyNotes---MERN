const express = require('express');
const router = express.Router()
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = 'Devanshisagoodboy';


// Create User
// POST "/api/auth/createuser"
router.post('/createuser', [
    body('name', 'Name must be atleast of 1 character').isLength({ min: 1 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast of 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    
    let success = false;

    // if error return bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {        
        // check whether user with same email exists already
        let user = await User.findOne({email: req.body.email});
    
        if(user){
            return res.status(400).json({error: "Sorry a user exists with this email already"})
        }
    
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt)

        user = await User.create({
          name: req.body.name,
          email: req.body.email,
          password: secPass,
        })

        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        
        success = true;
        res.json({success, authtoken})
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some error occured");
    }
})


// Authenticate User
// POST "/api/auth/login"
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').isLength({ min: 1 }),
], async (req, res) => {
    
    let success = false;

    // if error return bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email,password} = req.body;

    try {        
        // check whether user with same email exists already
        let user = await User.findOne({email});
    
        if(!user){
            success = false
            return res.status(400).json({error: "PLease login with correct credentials"})
        }
    
        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            success = false
            return res.status(400).json({success, error: "PLease login with correct credentials"})
        }


        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true
        res.json({success, authtoken})

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some error occured");
    }
})


// User Details
// GET "/api/auth/getuser"
// login required
router.post('/getuser', fetchuser, async (req, res) => {

    try {        
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some error occured");
    }
})

module.exports = router