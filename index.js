require('dotenv').config();
const request = require('request');
const express = require('express');
const fs = require('fs');
const app = express();

var port = process.env.PORT || 3000;
var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;

var redirectUri = 'http://localhost:' + port + '/callback/';
var authUrl = 'https://accounts.spotify.com/authorize/?' +
    'client_id=' + clientId +
    '&response_type=code' +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&scope=user-modify-playback-state%20user-read-playback-state';

app.get('/', function (req, res) {
    res.redirect(authUrl);
});

app.get('/callback', function (req, res) {
    if (req.query.error) {
        res.send('Error: ' + req.query.error);
        return;
    }

    if (!req.query.code) {
        res.send('Error: no code!');
        return;
    }

    getAccessToken(req.query.code, function (err, accessToken) {
        if (err) {
            res.send('getAccessToken Error:: ' + err);
            return;
        }

        if (accessToken.error) {
            res.send('Acces Token Error: ' + accessToken.error);
            return;
        }

        getDevices(accessToken, function(deviceError, devices) {
            if (deviceError) {
                res.send('getDevices Error: ' + deviceError);
                return;
            }

            var showData = accessToken;
            showData.devices = JSON.stringify(devices);

            parseFile('code.html', showData, function (err, data) {
                if (err) {
                    res.send('parseFile Error: ' + deviceError);
                    return;
                }
                res.send(data);
            });
        });
    });
});

function getAccessToken(code, callback) {
    request.post({
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
        },
        form: {
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri
        }
    },
        function (err, httpResponse, body) {
            if (err) {
                callback(err);
                return;
            }

            callback(err, JSON.parse(body));
        }
    );
}

function getDevices(token, callback) {
    request.get({
        url: 'https://api.spotify.com/v1/me/player/devices',
        headers: {
            'Authorization': token.token_type + ' ' + token.access_token
        },
    },
        function (err, httpResponse, body) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, JSON.parse(body));
        }
    );
}

function parseFile(file, values, callback) {
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            callback(err);
            return;
        }

        Object.keys(values).forEach(key => {
            data = data.replace(new RegExp('{' + key.toUpperCase() + '}', "g"), values[key]);
        });

        callback(null, data);
    });
}

app.listen(port, function () {
    console.log('Started at port %s!', port);
    console.log('Starting Browser...');
    var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    
    if(process.platform == 'win32')
        require('child_process').exec(start + ' \"\" \"' + authUrl + '\"');
    else
        require('child_process').exec(start + ' \'' + authUrl + '\'');
        
    console.log('...done');
});