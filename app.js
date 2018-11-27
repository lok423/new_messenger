const express = require('express');
const debug = require('debug')('app');
const morgan = require('morgan');
const chalk = require('chalk');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const expressJwt = require('express-jwt');
const config = require('./config/config.json');





const app = express();
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(session({
  secret: 'messenger'
}));
require('./config/passport')(app);



app.use(function (req, res, next) {
  debug("middlewre");
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type','X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

//   if (req.getMethod().equals("OPTIONS")) {
//     HttpUtil.setResponse(response, HttpStatus.OK.value(), null);
//     return;
// }


  // var token = req.body.token || req.query.token || req.headers['x-access-token']
  // if (token) {
  //   jwt.verify(token, app.get('secret'), function (err, decoded) {
  //     if (err) {
  //       return res.json({
  //         success: false,
  //         message: 'Failed to authenticate token.'
  //       })
  //     } else {
  //       req.decoded = decoded
  //       next()
  //     }
  //   })
  // } else {
  //   return res.status(403).send({
  //     success: false,
  //     message: 'No token provided.'
  //   })
  // }

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  //res.setHeader('Access-Control-Allow-Credentials', 'false');



  // Pass to next layer of middleware
  next();
});

app.use(expressJwt({
  secret: config.secret,
  getToken: function(req) {
    debug('jwt');
    //console.log(req);
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      req.token = req.headers.authorization.split(' ')[1];
      return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  }
  
  
}).unless({ path: ['/api/users/authenticate', '/api/users/register','/api/users/oauth/facebook'] }),function(req,res,next){
// debug(req.token);
next();
});

app.use(function(err, req, res, next) {
  console.log(err);
    if (err.name === 'UnauthorizedError') {
      res.status(401).send('Invalid Token');
    } else {
      throw err;
    }
  });


app.use('/api/users', require('./controllers/user.controller'));
var database = require('./controllers/local.database.controller');
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  const host = server.address().address;
  const port = server.address().port;
  debug('listening on port http://%s:%s', host, chalk.green(port));
});

require('./socket_io/socket_io')(server);