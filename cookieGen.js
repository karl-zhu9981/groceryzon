

var possible = "abcdefghijklmnopqrstuvwxyz0123456789";


function generateToken(){
    var token = "";
    for(var i = 0; i < 30;i++){
        token += possible[Math.floor(Math.random() * possible.length)];
    }
    return token;
}

module.exports.generateCookie = generateToken;