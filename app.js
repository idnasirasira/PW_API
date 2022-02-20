require('dotenv').config()

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var tokenRoute = require('./routes/token');
var usersRouter = require('./routes/users');
var todoListRouter = require('./routes/todo_list');

var { verifyToken } = require('./middleware/verifyToken');

var app = express();
app.use(cors({credentials: true, origin:'http://localhost:3000'}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/token', tokenRoute);
app.use('/users', verifyToken, usersRouter);
app.use('/todo', verifyToken, todoListRouter);

module.exports = app;
