// Simple script to test instead of using Postman

var http = require('http');
http.post('http://127.0.0.1:8787', function(res) {
    var data = [];
    console.log('Status Code: ' + res.statusCode);
    res.on('data', function (chunk) {
        data.push(chunk);
    });

    res.on('end', function () {
        var body = Buffer.concat(data).toString();
        console.log(body);
    });
})
