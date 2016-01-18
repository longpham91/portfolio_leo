var express      = require('express');
var app          = express();
var router       = express.Router();
var bodyParser   = require('body-parser');
var MessageController = require('./routes/message');

/**
 * Routing & middlewares
 */
app.use(express.static(__dirname + '/static'));
app.use(express.favicon(__dirname + '/favicon.ico'))
app.use(bodyParser.json({ extended: true }));
app.use(router);

router.post('/api/v1/message', MessageController.post);

app.use(function (request, response) {
    response.status(404).json({
        message: 'Oops! You may get lost!',
        code: 'E_NOTFOUND'
    });
});

app.use(function (error, request, response, next) {
    response.status(500).json({
        message: error.message,
        code: error.code
    });
});
module.exports = app;