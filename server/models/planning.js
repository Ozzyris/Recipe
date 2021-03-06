var mongoose = require("./mongoose"),
	moment = require('moment'),
	Promise = require('bluebird');

planning = new mongoose.Schema({
	author: {type: String},
	content: {type: String},
	date: {type: Date},
	meal: {type: String},
	shared_with: [
		{
			user_id: {type: String},
		}
	],
	url: {type: String},
	creation_date: {type: Date, default: moment()},
	edit_date: {type: Date, default: moment()},
}, {collection: 'planning'});

//CONTENT
planning.statics.update_content = function(task_url, payload){
	return new Promise((resolve, reject) => {
		planning.updateOne({ url : task_url }, {
			content: payload.content,
			edit_date: payload.edit_date
		})
		.exec()
		.then(is_content_updated =>{
			resolve( is_content_updated );
		})
	})
};

// GET TASK
planning.statics.get_task = function(task_url){
	return new Promise((resolve, reject) => {
		planning.find({url: task_url}, {'_id':1, 'content':1, 'url':1, 'author': 1, 'date':1, 'meal':1, 'creation_date':1, 'edit_date':1}).exec()
			.then(task => {
				if( task ){
					resolve( task[0] );
				}else{
					reject({ message: 'Error accessing the task', code: 'error_task'});
				}
			})
	})
};


// GET TASKS
planning.statics.get_tasks = function( first_date, last_date ){
	return new Promise((resolve, reject) => {
		planning.aggregate([
			{$unwind: "$shared_with"},
			{$match: {"shared_with.user_id" : "5d74f53987cd2f13e6a265ba"}},
			{$match: {
					"date": {
						$gte: new Date(first_date),
						$lte: new Date(last_date)
					}
				}
			}
		]).exec()
		// }, {'_id':1, 'content':1, 'url':1, 'author': 1, 'date':1, 'meal':1, 'creation_date':1, 'edit_date':1, 'shared_with':1}).exec()
			.then(tasks => {
				if( tasks ){
					resolve( tasks );
				}else{
					reject({ message: 'Error accessing weekly tasks', code: 'error_weekly_tasks'});
				}
			})
	})
};

var planning = mongoose.DB.model('planning', planning);

module.exports.planning = planning