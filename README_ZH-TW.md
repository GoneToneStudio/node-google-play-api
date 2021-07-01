# Google Play API (Node.js 套件)

[English](README.md) | 繁體中文

偽裝成 Android 裝置登入帳號發送請求取得 Google Play 資料！

PHP 版本：開發中

## 問題
如果發現任何 BUG，請在此回報：<https://github.com/GoneToneStudio/node-google-play-api/issues>

## 安裝
需要 Node.js 14.0.0 或更高版本。

### 使用 NPM
    npm install @gonetonestudio/google-play-api

## 取得 OAuth2 Token
- 前往 <https://accounts.google.com/EmbeddedSetup>
- 登入您的 Google 帳號
- 按下我同意
- 查看 Cookie
  
  ![查看 Cookie](docs/images/view_cookie.png)
  
- 展開 accounts.google.com > Cookie，找到 "oauth_token" 點擊，複製 "oauth2_4/" 開頭的值
  
  ![取得 OAuth2 Token](docs/images/get_oauth2_token.png)

## 取得 GSF ID (Google Service Framework ID)
您可以安裝此 App 取得 GSF ID：<https://play.google.com/store/apps/details?id=com.evozi.deviceid>

## 使用方法
### 使用 GooglePlayAPI 物件
```javascript
const gpAPI = new GooglePlayAPI("Your_Google_Account@gmail.com", "您的裝置 GSF ID (Google Service Framework ID)");
```

### 設定 User-Agent
```javascript
gpAPI.setUserAgent('User-Agent')
```

### 設定客戶端 ID
```javascript
gpAPI.setClientID('am-android-asus')
```

### 設定 SDK 版本
```javascript
gpAPI.setSdkVersion(28)
```

### 設定國家代碼
```javascript
gpAPI.setCountryCode('tw')
```

### 設定語言代碼
```javascript
gpAPI.setLanguageCode('zh-TW')
```

### 取得 App 詳細信息
```javascript
gpAPI.getGoogleToken('您的 OAuth2 Token', 'save/token.txt').then(async (token) => {
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

### 取得批量 App 詳細信息
```javascript
gpAPI.getGoogleToken('您的 OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  const bulkDetails = await gpAPI.bulkDetails('com.github.android', 'com.twitter.android', 'com.facebook.katana')
  console.log(bulkDetails)
})
```

### App 搜尋
```javascript
gpAPI.getGoogleToken('您的 OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  const search = await gpAPI.search('GitHub')
  console.log(search)
})
```

### 取得下載資訊
```javascript
gpAPI.getGoogleToken('您的 OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  const downloadInfo = await gpAPI.downloadInfo('com.github.android')
  console.log(downloadInfo)
})
```

### 取得下載 Apk 網址
```javascript
gpAPI.getGoogleToken('您的 OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  const downloadApkUrl = await gpAPI.downloadApkUrl('com.github.android')
  console.log(downloadApkUrl)
})
```

### 下載 Apk
```javascript
gpAPI.getGoogleToken('您的 OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  await gpAPI.downloadApk('com.github.android', 'save_folder')
})
```

### 取得附加文件資訊
```javascript
gpAPI.getGoogleToken('您的 OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  const additionalFileInfo = await gpAPI.additionalFileInfo('com.github.android')
  console.log(additionalFileInfo)
})
```

### 取得下載附加文件網址
```javascript
gpAPI.getGoogleToken('您的 OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  const downloadAdditionalFileUrls = await gpAPI.downloadAdditionalFileUrls('com.github.android')
  console.log(downloadAdditionalFileUrls)
})
```

### 下載附加文件
```javascript
gpAPI.getGoogleToken('您的 OAuth2 Token', 'save/token.txt').then(async (token) => {
  await gpAPI.googleAuth(token)

  await gpAPI.downloadAdditionalFiles('com.github.android', 'save_folder')
})
```

## License
[MIT](LICENSE)
