var config = require('./config/env.js');
var getJWTApiToken = require('./helpers/jwt_helper.js').getJWTApiToken;

module.exports.getAPIURL = (url) =>
{
    return config.apiURL + url + '?token=' + getJWTApiToken();
}