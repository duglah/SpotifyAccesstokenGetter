# SpotifyAccesstokenGetter

Small Node.js application to get an access_token, refresh_token and devices from Spotify Api.

## Preperations

### Spotify App

You need an Spotify app. See [https://developer.spotify.com/](https://developer.spotify.com/) for more informations.  
You must register `http://localhost:{PORT}/callback/` as redirect uri for your Spotify app. For example: `http://localhost:3000/callback/`

### Enviroment variables
```
PORT=3000
CLIENT_ID=urlClientIdOfSpotifyApp
CLIENT_SECRET=clientSecretOfSpotifyApp
```

You can add these to a .env file.

## Run
```
yarn install
```
or
```
npm install
```
and then
```
yarn run start
```
or
```
npm start
```