# Google Play API (Node.js Library)

English | [繁體中文](README_ZH-TW.md)

Access Google Play by logging in and making requests as an Android device!

A version of this library for PHP is being developed.

## Report Issues
Please report any bugs you discover at <http://github.com/GoneToneStudio/node-google-play-api/issues>

## Installation
Node.js 14.0.0 or newer is required.

### With NPM
    npm install @gonetonestudio/google-play-api

## Obtain an OAuth2 Token
- Navigate to <https://accounts.google.com/EmbeddedSetup>
- Sign in with your Google account
- Select "I agree"
- Navigate to "Cookie"
  ![View Cookie](docs/images/view_cookie.png)
- Expand accounts.google.com > Cookie, find "oauth_token", and select the value beginning with `oauth2_4/`
  ![Get your own OAuth2 Token](docs/images/get_oauth2_token.png)

## Obtain your GSF ID (Google Service Framework ID)
You can obtain your GSF ID by installing this app: <https://play.google.com/store/apps/details?id=com.evozi.deviceid>

## Examples
### Using GooglePlayAPI
```javascript
const gpAPI = new GooglePlayAPI("Your_Google_Account@gmail.com", "The GSF ID (Google Service Framework ID) of your device");
```

### Configuring User-Agent
```javascript
gpAPI.setUserAgent('User-Agent')
```

### Configuring Client ID
```javascript
gpAPI.setClientID('am-android-asus')
```

### Configuring SDK Version
```javascript
gpAPI.setSdkVersion(28)
```

### Configuring Country Code
```javascript
gpAPI.setCountryCode('tw')
```

### Configuring Language Code
```javascript
gpAPI.setLanguageCode('zh-TW')
```

### Retrieving application details
```javascript
gpAPI.getGoogleToken('Your OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  const details = await gpAPI.appDetails('com.github.android')

  console.log(`Title: ${details.title}`)
  console.log(`Description Html: ${details.descriptionHtml}`)
  console.log(`Developer Name: ${details.details.appDetails.developerName}`)
  console.log(`Version Code: ${details.details.appDetails.versionCode}`)
  console.log(`Version String: ${details.details.appDetails.versionString}`)
  console.log(`Package Name: ${details.details.appDetails.packageName}`)
  console.log(`Share Url: ${details.shareUrl}`)
  
  console.log(details)
})
```

### Retrieving application details in-bulk
```javascript
gpAPI.getGoogleToken('Your OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  const bulkDetails = await gpAPI.bulkDetails('com.github.android', 'com.twitter.android', 'com.facebook.katana')
  console.log(bulkDetails)
})
```

### Searching for an app
```javascript
gpAPI.getGoogleToken('Your OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  const search = await gpAPI.search('GitHub')
  console.log(search)
})
```

### Retrieving download data for an app
```javascript
gpAPI.getGoogleToken('Your OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  const downloadInfo = await gpAPI.downloadInfo('com.github.android')
  console.log(downloadInfo)
})
```

### Retrieving the link to an app package
```javascript
gpAPI.getGoogleToken('Your OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  const downloadApkUrl = await gpAPI.downloadApkUrl('com.github.android')
  console.log(downloadApkUrl)
})
```

### Downloading an app package
```javascript
gpAPI.getGoogleToken('Your OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  await gpAPI.downloadApk('com.github.android', 'save_folder')
})
```

### Retrieve additional files
```javascript
gpAPI.getGoogleToken('Your OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  const additionalFileInfo = await gpAPI.additionalFileInfo('com.github.android')
  console.log(additionalFileInfo)
})
```

### Retrieving links to additional files
```javascript
gpAPI.getGoogleToken('Your OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  const downloadAdditionalFileUrls = await gpAPI.downloadAdditionalFileUrls('com.github.android')
  console.log(downloadAdditionalFileUrls)
})
```

### Downloading the additional files
```javascript
gpAPI.getGoogleToken('Your OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  await gpAPI.downloadAdditionalFiles('com.github.android', 'save_folder')
})
```

## License
[MIT](LICENSE)
