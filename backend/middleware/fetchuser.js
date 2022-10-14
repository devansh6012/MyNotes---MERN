const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Devanshisagoodboy';

fetchuser = (req, res, next) => {
    // Get the user from jwt token and add id to req object
    // Here we are giving the name 'auth-token' to the header
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error: "Please authenticate using valid token"})
    }

    try {
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user
        next()
    } catch (error) {
        res.status(401).send({error: "Please authenticate using valid token"})
    }

}

module.exports = fetchuser;