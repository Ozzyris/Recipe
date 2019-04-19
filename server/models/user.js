var mongoose = require("./mongoose"),
    moment = require('moment'),
    Promise = require('bluebird');

var user = new mongoose.Schema({
    email: {type: String},
    given_name: {type: String},
    family_name: {type: String},
    password: {type: String},
    auth_record: {
        active_auth: {
            creation_date: {type: String},
            last_modification_date: {type: String},
            expiration_date: {type: String},
            keep_session: {type: Boolean, default: false},
            token: {type: String}
        },
        recorded_auth: [
            {
                creation_date: {type: String},
                last_modification_date: {type: String},
                ending_date: {type: String},
                keep_session: {type: String},
            }
        ]
    }
}, {collection: 'user'});

//COMMON
user.statics.check_email = function(email){
    return new Promise((resolve, reject) => {
        this.findOne({ email : email }).exec()
            .then( user => {
                if( !user ){
                    resolve( true );
                }else{
                    reject({ message: 'Your email already exist', code: 'email_duplicate'});
                }
            })
    })
};
user.statics.get_id_from_email = function(email){
    return new Promise((resolve, reject) => {
        this.findOne({ email : email }).exec()
            .then( user => {
                if( user ){
                    resolve( user._id );
                }else{
                    reject({ message: 'Your email does not exist', code: 'email_not_exist'});
                }
            })
    })
};
// user.statics.get_id_from_xtoken = function( session ){
//     return new Promise((resolve, reject) => {
//         this.findOne({ 'auth_record.token' : session }).exec()
//             .then( user => {
//                 if( user ){
//                     resolve( user._id );
//                 }else{
//                     reject({ message: 'Your email does not exist', code: 'email_not_exist'});
//                 }
//             })
//     })
// };
user.statics.get_userdetail_from_id = function( id ){
    return new Promise((resolve, reject) => {
        this.findOne({ _id : id }).exec()
            .then( user => {
                if( user ){
                    resolve( user )
                }else{
                    reject({ message: 'Your id does not exist', code: 'id_not_exist'});
                }
            })
    });
}

//MIDDLEWARE
user.statics.get_auth_detail_from_xtoken = function( xtoken ){
    return new Promise((resolve, reject) => {
        this.findOne({ 'auth_record.active_auth.token': xtoken }).exec()
            .then( user => {
                if( user ){
                    let active_session = user.auth_record.active_auth;
                    resolve( active_session );
                }else{
                    reject({ message: 'Your session does not exist', code: 'xtoken_not_exist'});
                }
            })
    });
}
user.statics.update_token_timestamp_from_xtoken = function( xtoken, session ){
    return new Promise((resolve, reject) => {
        user.updateOne({ 'auth_record.active_auth.token': xtoken }, {
            'auth_record.active_auth.last_modification_date': moment(),
            'auth_record.active_auth.expiration_date': session.expiration_date,
        }).exec()
        .then(session =>{
            resolve(true);
        })
    });
}

//SIGNIN
user.statics.get_password_from_email = function( email ){
    return new Promise((resolve, reject) => {
        this.findOne({ email : email }).exec()
            .then( user => {
                if( user ){
                    resolve( user.password )
                }else{
                    reject({ message: 'Your email does not exist', code: 'email_not_exist'});
                }
            })
    });
}
user.statics.save_session_detail_from_id = function (session, user_id){
    return new Promise((resolve, reject) => {
        user.updateOne({ _id: user_id }, {
            auth_record: {
                active_auth: {
                    creation_date: moment(),
                    last_modification_date: moment(),
                    expiration_date: session.expiration_date,
                    token: session.token
                }
            }
        }).exec()
        .then(session =>{
            resolve(true);
        })
    });
}

var user = mongoose.DB.model('user', user);
module.exports.user = user