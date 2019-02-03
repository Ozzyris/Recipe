const express = require('express'),
	  router = express.Router(),
	  bodyParser = require('body-parser');

// MIDDLEWARE
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

	router.get('/ping', function (req, res) {
		res.status(200).json({message: 'pong'});
	});

module.exports = {
	"public" : router
};