let jwt = require('jsonwebtoken');

let checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
  if(token) {
    var secret;
    if(process.env.NODE_ENV === "production") {
      secret = process.env.JWT_SECRET;
    } else {
      const config = require('./config.js');
      secret = config.secret;
    }

    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }

    jwt.verify(token,secret, (err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(403).send({ 
          success: false,
          message: 'Token is not valid' 
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({ 
      success: false,
      message: 'Auth token is not supplied'
    });
  }
};

module.exports = {
  checkToken: checkToken
}