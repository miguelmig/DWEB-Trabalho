var jwt = require('jsonwebtoken')
var api_token = null;
var private_key = null;
var fs = require('fs');
const credentials = require('../config/credentials');

function getJWTApiToken()
{
    if(!api_token)
    {
        api_token = jwt.sign({ sub: 'token gerado na aula de DAW2019' },
            "segredo",
            {
                
                expiresIn: 60*60*24*7,
                issuer: "jwt_helper.js(WebServer)"
            })
    }
    //console.log('Token structure: ');
    //console.dir(api_token);
    return api_token;
}

function getPrivateKey()
{
    if(!private_key)
    {
        private_key = fs.readFileSync('../' + credentials.privateKeyFileName);
    }
    return private_key;
}

function verifyJWTToken(token)
{
    try
    {
        payload = jwt.verify(token, "segredo");
        return true;
    }
    catch
    {
        return false;
    }
}

module.exports.getJWTApiToken = getJWTApiToken;
module.exports.verifyJWTApiToken = verifyJWTToken;