
const express = require('express');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');
const chalk = require('chalk');
const app = express();
app.use(morgan('tiny'));

app.use(function (req, res, next) {
  debug("middlewre");
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// app.use('/api/preparedata',require('./controllers/preparedata.controller'));
var database = require('./controllers/local.database.controller');
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  const host = server.address().address;
  const port = server.address().port;
  debug('listening on port http://%s:%s', host, chalk.green(port));
});

// webCrawler.crawlinit();
