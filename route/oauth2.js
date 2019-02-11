// Import
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const node_config = process.env.NODE_ENV || 'development';
const util = require('util');
const config = require('config-node')({
    dir: 'config', // where to look for files  
    ext: null, // spoil the fun, tell me which one it is ('' for directory). Improves performance. 
    env: node_config // set which one instead of smart defaults 
});

// Variable
const algorithm = 'aes-128-cbc';
const password = "snoopy";
const hash = crypto.createHash("sha1");
hash.update(password);
const key = hash.digest().slice(0, 16);

const iv = crypto.randomBytes(16);


// Function
function encrypt(text){
  var cipher = crypto.createCipheriv(algorithm,key,iv);
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipheriv(algorithm,key,iv);
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

function generateAccessToken(client_id, duration) {
    // Generate a generation date + 5 minutes
    let expire = new Date(Date.now() + duration);
    let secureObject = {
    	client_id : client_id,
    	expireAt : expire.toISOString()
    }; 
    // Generate code
    return encrypt(JSON.stringify(secureObject));
}

router.post('/token', function(req, res, next) {
   	    console.log('Request body: ' + JSON.stringify(req.body));	
	    let client_id = req.body.client_id;
	    let redirect_uri = req.body.redirect_uri;
	    let code = req.body.code;
	    let grant_type = req.body.grant_type;
	    let client_secret = req.body.client_secret;
	    // Check client id
	    if (config.oauth2.client_id != client_id) {
	  	console.log('Invalid client_id');
	  	return res.status(400).send('{"error": "invalid_grant"}');
	    }
	    const duration_ms = 3600 * 2 * 1000; // 2 Hours
	    if (grant_type == "authorization_code") {
	  	 // Check authorization issue time
	  	 const authCode = JSON.parse(decrypt(code));
	  	 console.log('client_id',authCode.client_id, 'expireAt',authCode.expireAt);
	  	 if (Date.now() > Date.parse(authCode.expireAt)) {
	  		console.log('Invalid expiration ', Date.now(), 'expiration is',Date.parse(authCode.expireAt));
			return res.status(400).send('{"error": "invalid_grant"}');
	  	 }
	  	 if (authCode.client_id != client_id) {
	  		console.log('Invalid client_id ', authCode.client_id, 'current is', client_id);
	  		return res.status(400).send('{"error": "invalid_grant"}');	
	  	 }

	    	 console.log("grant_type=", grant_type, "redirect_uri=", redirect_uri);
	    	 res.setHeader('Content-Type', 'application/json');
		 // Token duration
	    	 return res.status(200).json({ token_type : "bearer", access_token: generateAccessToken(client_id, duration_ms), expires_in: duration_ms / 1000, refresh_token: "enLUfCCzKr3ude8mGyTPXXncBOuhqAMvuj6x618FkjkEfA2fowjZfeoc0DFdridriEZrC5e5h5bZGmX2"});
	    } else {
	         let refresh_token = req.body.refresh_token;
		 if ((refresh_token == "enLUfCCzKr3ude8mGyTPXXncBOuhqAMvuj6x618FkjkEfA2fowjZfeoc0DFdridriEZrC5e5h5bZGmX2") && (client_secret == "snoopy")){
		   return res.status(200).json({ token_type : "bearer", access_token: generateAccessToken(client_id, duration_ms), expires_in: duration_ms / 1000});
		 }
	    }
	    return res.status(400).send('{"error": "invalid_grant"}');	

});

// Routes
router.get('/auth', function(req, res, next) {
	// console.log('Request headers: ' + JSON.stringify(req.headers));
 //  	console.log('Request body: ' + JSON.stringify(req.body));	
 //  	console.log('Request query: ' + JSON.stringify(req.query));	
    if (req.headers["user-agent"] != "OpenAuth") {
		let client_id = req.query.client_id;
	    let redirect_uri = req.query.redirect_uri;
	    let state = req.query.state;
	    let response_type = req.query.response_type;
	    let authCode = req.query.code;
	    // Check query type
	    if ('code' != response_type)
	      return res.status(500).send('response_type ' + response_type + ' must equal "token"');
	  	// console.log('projectid=',config.oauth2.project_id,"uri=",redirect_uri);
	  	// Check client id
	  	if (config.oauth2.client_id != client_id) {
	  		return res.status(500).send('Wrong Client ID.');
	  	}
	  	// Check project ID
	  	if (redirect_uri.indexOf(config.oauth2.project_id) == -1) {
	  		return res.status(500).send('Wrong Project ID.');
	  	}
	    // if you have an authcode use that
	    if (authCode) {
	      return res.redirect(util.format('%s?code=%s&state=%s',
	        redirect_uri, authCode, state
	      ));
	    }
	    // Generate code
	    authCode = generateAccessToken(client_id, 60000 * 5);
	    // If generation successed
	    if (authCode) {
	      return res.redirect(util.format('%s?code=%s&state=%s', redirect_uri, authCode, state));
	    }
	} else {
		let client_id = req.body.client_id;
	    let redirect_uri = req.body.redirect_uri;
	    let code = req.body.code;
	    let grant_type = req.body.grant_type;
	    let client_secret = req.body.client_secret;
	    // Check client id
	  	if (config.oauth2.client_id != client_id) {
	  		return res.status(400).send('{"error": "invalid_grant"}');
	  	}
	  	// Check authorization issue time
	  	const authCode = decrypt(code);
	  	if (Date.now() > Date.parse(authCode.expireAt)) {
			return res.status(400).send('{"error": "invalid_grant"}');
	  	}
	  	if (authCode.client_id != client_id) {
	  		return res.status(400).send('{"error": "invalid_grant"}');	
	  	}

	    console.log("grant_type=", grant_type, "redirect_uri=", redirect_uri);
	    res.setHeader('Content-Type', 'application/json');
		// Token duration
		const duration_ms = 3600 * 2 * 1000; // 2 Hours
	    if (grant_type == "authorization_code") {
	    	return res.status(200).json({ token_type : "bearer", access_token: generateAccessToken(client_id, duration_ms), expires_in: duration_ms / 1000, refresh_token: "enLUfCCzKr3ude8mGyTPXXncBOuhqAMvuj6x618FkjkEfA2fowjZfeoc0DFdridriEZrC5e5h5bZGmX2"});
		} else {
			return res.status(200).json({ token_type : "bearer", access_token: generateAccessToken(client_id, duration_ms), expires_in: duration_ms / 1000});
		}
	}

    return res.status(400).send('{"error": "invalid_grant"}');  	
});

module.exports = router;
