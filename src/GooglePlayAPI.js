/**
 * Copyright 2021 GoneTone
 *
 * Google Play API (Unofficial Node.js Library)
 * https://github.com/GoneToneStudio/node-google-play-api
 *
 * @author   張文相 Wenxiang Zhang (旋風之音 GoneTone) <https://blog.reh.tw>
 * @license  MIT <https://github.com/GoneToneStudio/node-google-play-api/blob/master/LICENSE>
 */

'use strict'

const axios = require('axios')
const qs = require('qs')
const ini = require('ini')
const { map } = require('lodash')

const ProtoBuf = require('./ProtoBuf')
const { readToken, writeToken, isExists, isExtMatch, downloadFile } = require('./FileControl')

class GooglePlayAPI {
  /**
   * GooglePlayAPI constructor.
   *
   * @param {string} email Google Mail
   * @param {string} gfsID GSF ID (Google Service Framework ID)
   */
  constructor (email, gfsID) {
    this._email = email
    this._gfsID = gfsID

    this._apiEndpoint = 'https://android.clients.google.com'
    this._authPath = '/auth'
    this._playApiPath = '/fdfe'

    this._userAgent = 'Android-Finsky/20.4.13-all%20%5B0%5D%20%5BPR%5D%20313854362 (api=3,versionCode=82041300,sdk=28,device=ASUS_Z01QD_1,hardware=qcom,product=WW_Z01QD,platformVersionRelease=9,model=ASUS_Z01QD,buildId=PKQ1.190101.001,isWideScreen=0)'
    this._clientID = 'am-android-asus'
    this._googlePlayServiceVersion = '212116028'
    this._sdkVersion = '28'
    this._callerSig = '38918a453d07199354f8b19af05ec6562ced5788'
    this._callerPkg = 'com.google.android.gms'

    this._countryCode = 'us'
    this._languageCode = 'en-US'

    this._enabledExperiments = [
      'cl:billing.select_add_instrument_by_default'
    ]
    this._unsupportedExperiments = [
      'nocache:billing.use_charging_poller',
      'market_emails',
      'buyer_currency',
      'prod_baseline',
      'checkin.set_asset_paid_app_field',
      'shekel_test',
      'content_ratings',
      'buyer_currency_in_app',
      'nocache:encrypted_apk',
      'recent_changes'
    ]

    this._axiosConfigForGooglePlay = {}
    this._axiosConfigForGooglePlay_Protobuf = {}

    this._axiosConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      }
    }

    this._protoBuf = new ProtoBuf()
  }

  /**
   * Set User-Agent
   *
   * @param {String} userAgent User-Agent
   */
  setUserAgent (userAgent) {
    this._userAgent = userAgent
  }

  /**
   * Set Client ID
   *
   * @param {String} clientID Client ID
   */
  setClientID (clientID) {
    this._clientID = clientID
  }

  /**
   * Set SDK Version
   *
   * @param {Number} sdkVersion SDK Version
   */
  setSdkVersion (sdkVersion) {
    this._sdkVersion = sdkVersion.toString()
  }

  /**
   * Set Country Code
   *
   * @param {String} countryCode Country Code
   */
  setCountryCode (countryCode) {
    this._countryCode = countryCode
  }

  /**
   * Set Language Code
   *
   * @param {String} languageCode Language Code
   */
  setLanguageCode (languageCode) {
    this._languageCode = languageCode.replace('_', '-')
  }

  /**
   * Get Google Token
   *
   * @param {String} oauth2Token OAuth2 Token
   * @param {String} saveTokenFilePath Save OAuth2 Token Path (default token.txt)
   *
   * @returns {Promise<String>}
   */
  async getGoogleToken (oauth2Token, saveTokenFilePath = 'token.txt') {
    if (oauth2Token.startsWith('oauth2_4/')) {
      const pathIsExists = await isExists(saveTokenFilePath)
      if (pathIsExists) {
        return await readToken(saveTokenFilePath)
      }

      try {
        const axiosData = await axios.post(`${this._apiEndpoint}${this._authPath}`, qs.stringify({
          androidId: this._gfsID.toString(),
          lang: this._languageCode.toString(),
          google_play_services_version: this._googlePlayServiceVersion.toString(),
          sdk_version: this._sdkVersion.toString(),
          device_country: this._countryCode.toString(),
          callerSig: this._callerSig.toString(),
          client_sig: this._callerSig.toString(),
          token_request_options: 'CAA4AQ==',
          Email: this._email.toString(),
          droidguardPeriodicUpdate: '1',
          service: 'ac2dm',
          system_partition: '1',
          check_email: '1',
          callerPkg: this._callerPkg.toString(),
          get_accountid: '1',
          ACCESS_TOKEN: '1',
          add_account: '1',
          Token: oauth2Token.toString()
        }), this._axiosConfig)

        const parse = ini.parse(axiosData.data)

        const token = parse.Token
        await writeToken(saveTokenFilePath, token)

        return token
      } catch (e) {
        throw Error(`Get Google Token Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
      }
    } else {
      throw Error('Get Google Token Failed: OAuth2 Token must start with "oauth2_4/".')
    }
  }

  /**
   * Google Auth
   *
   * @param {String} token Token
   */
  async googleAuth (token) {
    if (token.startsWith('aas_et/')) {
      try {
        const axiosData = await axios.post(`${this._apiEndpoint}${this._authPath}`, qs.stringify({
          androidId: this._gfsID.toString(),
          lang: this._languageCode.toString(),
          google_play_services_version: this._googlePlayServiceVersion.toString(),
          sdk_version: this._sdkVersion.toString(),
          device_country: this._countryCode.toString(),
          callerSig: this._callerSig.toString(),
          client_sig: this._callerSig.toString(),
          token_request_options: 'CAA4AVAB',
          Email: this._email.toString(),
          service: 'oauth2:https://www.googleapis.com/auth/googleplay',
          system_partition: '1',
          check_email: '1',
          callerPkg: this._callerPkg.toString(),
          Token: token.toString(),
          oauth2_foreground: '1',
          app: 'com.android.vending',
          _opt_is_called_from_account_manager: '1',
          is_called_from_account_manager: '1'
        }), this._axiosConfig)

        const parse = ini.parse(axiosData.data)
        // noinspection JSUnresolvedVariable
        const auth = parse.Auth

        this._axiosConfigForGooglePlay = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            Host: 'android.clients.google.com',
            'User-Agent': this._userAgent,
            'Accept-Language': this._languageCode,
            Authorization: `Bearer ${auth}`,
            'X-DFE-Device-Id': this._gfsID,
            'X-DFE-Client-Id': this._clientID,
            'X-DFE-Userlanguages': this._languageCode.replace('-', '_'),
            'X-DFE-Enabled-Experiments': this._enabledExperiments.join(','),
            'X-DFE-Unsupported-Experiments': this._unsupportedExperiments.join(','),
            'X-DFE-SmallestScreenWidthDp': '320',
            'X-DFE-Filter-Level': '3'
          },
          decompress: false,
          responseType: 'arraybuffer',
          responseEncoding: null
        }
        this._axiosConfigForGooglePlay_Protobuf = JSON.parse(JSON.stringify(this._axiosConfigForGooglePlay))
        this._axiosConfigForGooglePlay_Protobuf.headers['Content-Type'] = 'application/x-protobuf'
      } catch (e) {
        throw Error(`Google Auth Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
      }
    } else {
      if (token.startsWith('oauth2_4/')) {
        throw Error('Google Auth Failed: Token must start with "aas_et/", please use gpAPI.getGoogleToken() to get Token.')
      }

      throw Error('Google Auth Failed: Token must start with "aas_et/".')
    }
  }

  /**
   * Get App Details
   *
   * @param {String} packageName App Package Name
   *
   * @returns {Promise<Object>}
   */
  async appDetails (packageName) {
    try {
      const apiUrlAppend = new URL(`${this._apiEndpoint}${this._playApiPath}/details`)
      apiUrlAppend.searchParams.append('doc', packageName.toString())

      const apiUrl = apiUrlAppend.href
      const axiosData = await axios.get(apiUrl, this._axiosConfigForGooglePlay)

      // noinspection JSUnresolvedVariable
      return this._protoBuf.decode(axiosData.data).payload.detailsResponse.item
    } catch (e) {
      throw Error(`Get "${packageName}" App Detail Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Get Bulk Details
   *
   * @param {String} packages App Packages
   *
   * @returns {Promise<Object>}
   */
  async bulkDetails (...packages) {
    try {
      const data = this._protoBuf.bulkDetailsRequest(...packages)

      const axiosData = await axios.post(`${this._apiEndpoint}${this._playApiPath}/bulkDetails`, data, this._axiosConfigForGooglePlay_Protobuf)
      // noinspection JSUnresolvedVariable
      return map(this._protoBuf.decode(axiosData.data).payload.bulkDetailsResponse.entry, 'item')
    } catch (e) {
      throw Error(`Get Bulk Details Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * App Search
   *
   * @param {String} keyword Search Keyword
   *
   * @returns {Promise<Object>}
   */
  async search (keyword) {
    try {
      const apiUrlAppend = new URL(`${this._apiEndpoint}${this._playApiPath}/search`)
      apiUrlAppend.searchParams.append('q', keyword.toString())
      apiUrlAppend.searchParams.append('c', '3')

      const apiUrl = apiUrlAppend.href
      const axiosData = await axios.get(apiUrl, this._axiosConfigForGooglePlay)

      // noinspection JSUnresolvedVariable
      return this._protoBuf.decode(axiosData.data).preFetch[0].response.payload.listResponse.item[0].subItem
    } catch (e) {
      throw Error(`App Search Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Get App Delivery
   *
   * @param {String} packageName App Package Name
   * @param {Number} offerType Offer Type
   * @param {Number} versionCode App Version Code
   *
   * @returns {Promise<Object>}
   */
  async appDelivery (packageName, offerType, versionCode) {
    try {
      const apiUrlAppend = new URL(`${this._apiEndpoint}${this._playApiPath}/delivery`)
      apiUrlAppend.searchParams.append('doc', packageName.toString())
      apiUrlAppend.searchParams.append('ot', offerType.toString())
      apiUrlAppend.searchParams.append('vc', versionCode.toString())

      const apiUrl = apiUrlAppend.href
      const axiosData = await axios.get(apiUrl, this._axiosConfigForGooglePlay)

      // noinspection JSUnresolvedVariable
      return this._protoBuf.decode(axiosData.data).payload.deliveryResponse
    } catch (e) {
      throw Error(`Get "${packageName}" App Delivery Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Make Purchase Request
   *
   * @param {String} packageName App Package Name
   * @param {Number} offerType Offer Type
   * @param {Number} versionCode App Version Code
   *
   * @returns {Promise<Object>}
   */
  async purchase (packageName, offerType, versionCode) {
    try {
      const axiosData = await axios.post(`${this._apiEndpoint}${this._playApiPath}/purchase`, qs.stringify({
        doc: packageName.toString(),
        ot: offerType.toString(),
        vc: versionCode.toString()
      }), this._axiosConfigForGooglePlay)

      // noinspection JSUnresolvedVariable
      return this._protoBuf.decode(axiosData.data).payload.buyResponse
    } catch (e) {
      throw Error(`Make "${packageName}" Purchase Request Failed: ${(typeof e.response !== 'undefined') ? this._protoBuf.decode(e.response.data).commands.displayErrorMessage : e.message}`)
    }
  }

  /**
   * Get Download Info
   *
   * @param {String} packageName App Package Name
   *
   * @returns {Promise<Object|Boolean>}
   */
  async downloadInfo (packageName) {
    try {
      const appDetails = await this.appDetails(packageName)
      // noinspection JSUnresolvedVariable
      const offerType = appDetails.offer[0].offerType
      // noinspection JSUnresolvedVariable
      const versionCode = appDetails.details.appDetails.versionCode

      if (versionCode) {
        await this.purchase(packageName, offerType, versionCode)
        const appDelivery = await this.appDelivery(packageName, offerType, versionCode)

        // noinspection JSUnresolvedVariable
        if (appDelivery.appDeliveryData !== null) {
          // noinspection JSUnresolvedVariable
          return appDelivery.appDeliveryData
        }
      }
    } catch (e) {
      throw Error(`Get "${packageName}" Download Info Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }

    throw Error(`Get "${packageName}" download info failed, may be the device does not support.`)
  }

  /**
   * Get Download Apk Url
   *
   * @param {String} packageName App Package Name
   *
   * @returns {Promise<String>}
   */
  async downloadApkUrl (packageName) {
    try {
      const downloadInfo = await this.downloadInfo(packageName)

      // noinspection JSUnresolvedVariable
      return downloadInfo.downloadUrl
    } catch (e) {
      throw Error(`Get "${packageName}" Download Apk Url Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Download Apk
   *
   * @param {String} packageName App Package Name
   * @param {String} outputPath Output Save Path
   * @param {String|null} outputFileName Output File Save Name (Default App Package Name)
   *
   * @returns {Promise<void>}
   */
  async downloadApk (packageName, outputPath, outputFileName = null) {
    try {
      let fileName = outputFileName ?? packageName
      if (!isExtMatch(fileName, 'apk')) {
        fileName += '.apk'
      }

      const downloadApkUrl = await this.downloadApkUrl(packageName)
      await downloadFile(downloadApkUrl, outputPath, fileName)
    } catch (e) {
      throw Error(`Download "${packageName}" Apk Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Get Split Delivery Data Info
   *
   * @param {String} packageName App Package Name
   *
   * @returns {Promise<Object>}
   */
  async splitDeliveryDataInfo (packageName) {
    try {
      const downloadInfo = await this.downloadInfo(packageName)

      // noinspection JSUnresolvedVariable
      return downloadInfo.splitDeliveryData
    } catch (e) {
      throw Error(`Get "${packageName}" Split Delivery Data Info Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Get Download Split Apks Name And Url
   *
   * @param {String} packageName App Package Name
   *
   * @returns {Promise<Object>}
   */
  async downloadSplitApksNameAndUrl (packageName) {
    try {
      const splitDeliveryData = await this.splitDeliveryDataInfo(packageName)

      return map(splitDeliveryData, data => {
        return {
          name: data.name,
          downloadUrl: data.downloadUrl
        }
      })
    } catch (e) {
      throw Error(`Get "${packageName}" Download Split Apks Name And Url Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Download Split Apks
   *
   * @param {String} packageName App Package Name
   * @param {String} outputPath Output Save Path
   * @param {String|null} outputFileNamePrefixe Output File Save Name Prefixe (Default App Package Name)
   *
   * @returns {Promise<void>}
   */
  async downloadSplitApks (packageName, outputPath, outputFileNamePrefixe = null) {
    try {
      const fileName = outputFileNamePrefixe ?? packageName

      const downloadSplitApksNameAndUrl = await this.downloadSplitApksNameAndUrl(packageName)
      for (const data of downloadSplitApksNameAndUrl) {
        // noinspection JSUnresolvedVariable
        await downloadFile(data.downloadUrl, outputPath, `${fileName}-${data.name}.apk`)
      }
    } catch (e) {
      throw Error(`Download "${packageName}" Split Apks Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Get Additional File Info
   *
   * @param {String} packageName App Package Name
   *
   * @returns {Promise<Object>}
   */
  async additionalFileInfo (packageName) {
    try {
      const downloadInfo = await this.downloadInfo(packageName)

      // noinspection JSUnresolvedVariable
      return downloadInfo.additionalFile
    } catch (e) {
      throw Error(`Get "${packageName}" Additional File Info Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Get Download Additional File Urls
   *
   * @param {String} packageName App Package Name
   *
   * @returns {Promise<Object>}
   */
  async downloadAdditionalFileUrls (packageName) {
    try {
      const additionalFileInfo = await this.additionalFileInfo(packageName)

      return map(additionalFileInfo, 'downloadUrl')
    } catch (e) {
      throw Error(`Get "${packageName}" Download Additional File Urls Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Download Additional Files
   *
   * @param {String} packageName App Package Name
   * @param {String} outputPath Output Save Path
   * @param {String|null} outputFileName Output File Save Name (Default App Package Name)
   *
   * @returns {Promise<void>}
   */
  async downloadAdditionalFiles (packageName, outputPath, outputFileName = null) {
    try {
      const fileName = outputFileName ?? packageName

      const downloadAdditionalFileUrls = await this.downloadAdditionalFileUrls(packageName)
      for (const [key, url] of downloadAdditionalFileUrls.entries()) {
        await downloadFile(url, outputPath, `${fileName}_${(key + 1)}`)
      }
    } catch (e) {
      throw Error(`Download "${packageName}" Additional Files Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }
}

module.exports = GooglePlayAPI
