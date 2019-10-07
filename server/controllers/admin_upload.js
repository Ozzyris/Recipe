const express = require('express'),
	  router = express.Router(),
	  moment = require('moment'),
	  bodyParser = require('body-parser'),
	  recipe_model = require('../models/recipe').recipe;

const upload_manager = require('../helpers/upload_manager');
const single_image_upload = upload_manager.single('image');

// MIDDLEWARE
router.use( require('../middlewares/index').check_auth );
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

	router.get('/ping', function (req, res) {
		res.status(200).json({message: 'pong'});
	});

	router.post('/recipe-header', function (req, res) {
		let recipe_id = req.body.recipe_id,
			payload = {
				illustration: '',
				edit_date: moment()
			};

		single_image_upload(req, res, function(err){
			payload.illustration = req.file.location;
			
			console.log(payload);
			recipe_model.update_illustration( recipe_id, payload )
				.then( is_title_updated => {
					res.status(200).json({message: 'Illustration updated', code: 'illustration_updated', edit_date: payload.edit_date});
				})
				.catch( error => {
					res.status(401).json( error );
				})
			})
	});

module.exports = {
	"admin_upload" : router
};