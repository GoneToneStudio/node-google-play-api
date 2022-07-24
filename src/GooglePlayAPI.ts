/**
 * Copyright 2022 GoneTone
 *
 * Google Play API (Unofficial Node.js Library)
 * https://github.com/GoneToneStudio/node-google-play-api
 *
 * @author   張文相 Wenxiang Zhang (旋風之音 GoneTone) <https://blog.reh.tw>
 * @license  MIT <https://github.com/GoneToneStudio/node-google-play-api/blob/master/LICENSE>
 */

import type {
  IAndroidAppDeliveryData,
  IAppFileMetadata,
  IBuyResponse,
  IDeliveryResponse,
  IItem,
  ISplitDeliveryData
} from '../proto/google_play'

import axios from 'axios'
import qs from 'qs'
import ini from 'ini'
import { map } from 'lodash'

import * as protoBuf from './ProtoBuf'
import {
  readToken,
  writeToken,
  isExists,
  isExtMatch,
  downloadFile
} from './FileControl'

interface AxiosConfig {
  headers: {
    'Content-Type': string
  }
}

export class GooglePlayAPI {
  private readonly _email: string
  private readonly _gsfID: string

  private readonly _apiEndpoint: string
  private readonly _apiEndpointStore: string
  private readonly _authPath: string
  private readonly _playApiPath: string

  private _userAgent: string
  private _clientID: string
  private readonly _googlePlayServiceVersion: string
  private _sdkVersion: string
  private readonly _callerSig: string
  private readonly _callerPkg: string

  private _countryCode: string
  private _languageCode: string

  private readonly _enabledExperiments: string[]
  private readonly _unsupportedExperiments: string[]

  private _axiosConfigForGooglePlay: any
  private _axiosConfigForGooglePlay_Protobuf: any

  private readonly _axiosConfig: AxiosConfig

  /**
   * GooglePlayAPI constructor.
   *
   * @param {string} email Google Mail
   * @param {string} gsfID GSF ID (Google Service Framework ID)
   */
  public constructor (email: string, gsfID: string) {
    this._email = email
    this._gsfID = gsfID

    this._apiEndpoint = 'https://android.clients.google.com'
    this._apiEndpointStore = 'https://play-fe.googleapis.com'
    this._authPath = '/auth'
    this._playApiPath = '/fdfe'

    this._userAgent = 'Android-Finsky/20.4.13-all%20%5B0%5D%20%5BPR%5D%20313854362 (api=3,versionCode=82041300,sdk=28,device=ASUS_Z01QD_1,hardware=qcom,product=WW_Z01QD,platformVersionRelease=9,model=ASUS_Z01QD,buildId=PKQ1.190101.001,isWideScreen=0,supportedAbis=arm64-v8a;armeabi-v7a;armeabi)'
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
  }

  /**
   * Set User-Agent
   *
   * @param {string} userAgent User-Agent
   */
  public setUserAgent (userAgent: string): void {
    this._userAgent = userAgent
  }

  /**
   * Set Client ID
   *
   * @param {string} clientID Client ID
   */
  public setClientID (clientID: string): void {
    this._clientID = clientID
  }

  /**
   * Set SDK Version
   *
   * @param {number} sdkVersion SDK Version
   */
  public setSdkVersion (sdkVersion: number): void {
    this._sdkVersion = sdkVersion.toString()
  }

  /**
   * Set Country Code
   *
   * @param {string} countryCode Country Code
   */
  public setCountryCode (countryCode: string): void {
    this._countryCode = countryCode
  }

  /**
   * Set Language Code
   *
   * @param {string} languageCode Language Code
   */
  public setLanguageCode (languageCode: string): void {
    this._languageCode = languageCode.replace('_', '-')
  }

  /**
   * Get Google Token
   *
   * @param {string} oauth2Token OAuth2 Token
   * @param {string} saveTokenFilePath Save OAuth2 Token Path (default token.txt)
   *
   * @returns {Promise<string>}
   */
  public async getGoogleToken (oauth2Token: string, saveTokenFilePath = 'token.txt'): Promise<string> {
    if (oauth2Token.startsWith('oauth2_4/')) {
      const pathIsExists = await isExists(saveTokenFilePath)
      if (pathIsExists) {
        return await readToken(saveTokenFilePath)
      }

      try {
        const axiosData = await axios.post(`${this._apiEndpoint}${this._authPath}`, qs.stringify({
          androidId: this._gsfID.toString(),
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

        return token as string
      } catch (e: any) {
        throw Error(`Get Google Token Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
      }
    } else {
      throw Error('Get Google Token Failed: OAuth2 Token must start with "oauth2_4/".')
    }
  }

  /**
   * Google Auth
   *
   * @param {string} token Token
   */
  public async googleAuth (token: string): Promise<void> {
    if (token.startsWith('aas_et/')) {
      try {
        const axiosData = await axios.post(`${this._apiEndpoint}${this._authPath}`, qs.stringify({
          androidId: this._gsfID.toString(),
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
        const auth = parse.Auth

        this._axiosConfigForGooglePlay = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            Host: 'play-fe.googleapis.com',
            'User-Agent': this._userAgent,
            'Accept-Language': this._languageCode,
            Authorization: `Bearer ${auth}`,
            'X-DFE-Device-Id': this._gsfID,
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
      } catch (e: any) {
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
   * @param {string} packageName App Package Name
   *
   * @returns {Promise<IItem | null | undefined>}
   */
  public async appDetails (packageName: string): Promise<IItem | null | undefined> {
    try {
      const apiUrlAppend = new URL(`${this._apiEndpointStore}${this._playApiPath}/details`)
      apiUrlAppend.searchParams.append('doc', packageName.toString())

      const apiUrl = apiUrlAppend.href
      const axiosData = await axios.get(apiUrl, this._axiosConfigForGooglePlay)

      return protoBuf.decode(axiosData.data).payload?.detailsResponse?.item
    } catch (e: any) {
      throw Error(`Get "${packageName}" App Detail Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Get Bulk Details
   *
   * @param {string[]} packages App Packages
   *
   * @returns {Promise<IItem[] | null | undefined>}
   */
  public async bulkDetails (...packages: string[]): Promise<IItem[] | null | undefined> {
    try {
      const data = protoBuf.bulkDetailsRequest(...packages)

      const axiosData = await axios.post(`${this._apiEndpointStore}${this._playApiPath}/bulkDetails`, data, this._axiosConfigForGooglePlay_Protobuf)

      return map(protoBuf.decode(axiosData.data).payload?.bulkDetailsResponse?.entry, 'item') as IItem[] | null | undefined
    } catch (e: any) {
      throw Error(`Get Bulk Details Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * App Search
   *
   * @param {string} keyword Search Keyword
   *
   * @returns {Promise<IItem[] | null | undefined>}
   */
  public async search (keyword: string): Promise<IItem[] | null | undefined> {
    try {
      const apiUrlAppend = new URL(`${this._apiEndpointStore}${this._playApiPath}/search`)
      apiUrlAppend.searchParams.append('q', keyword.toString())
      apiUrlAppend.searchParams.append('c', '3')

      const apiUrl = apiUrlAppend.href
      const axiosData = await axios.get(apiUrl, this._axiosConfigForGooglePlay)

      return protoBuf.decode(axiosData.data).preFetch?.[0]?.response?.payload?.listResponse?.item?.[0]?.subItem
    } catch (e: any) {
      throw Error(`App Search Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Get App Delivery
   *
   * @param {string} packageName App Package Name
   * @param {number} offerType Offer Type
   * @param {number} versionCode App Version Code
   *
   * @returns {Promise<IDeliveryResponse | null | undefined>}
   */
  public async appDelivery (packageName: string, offerType: number, versionCode: number): Promise<IDeliveryResponse | null | undefined> {
    try {
      const apiUrlAppend = new URL(`${this._apiEndpointStore}${this._playApiPath}/delivery`)
      apiUrlAppend.searchParams.append('doc', packageName.toString())
      apiUrlAppend.searchParams.append('ot', offerType.toString())
      apiUrlAppend.searchParams.append('vc', versionCode.toString())

      const apiUrl = apiUrlAppend.href
      const axiosData = await axios.get(apiUrl, this._axiosConfigForGooglePlay)

      return protoBuf.decode(axiosData.data).payload?.deliveryResponse
    } catch (e: any) {
      throw Error(`Get "${packageName}" App Delivery Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Make Purchase Request
   *
   * @param {string} packageName App Package Name
   * @param {number} offerType Offer Type
   * @param {number} versionCode App Version Code
   *
   * @returns {Promise<IBuyResponse | null | undefined>}
   */
  public async purchase (packageName: string, offerType: number, versionCode: number): Promise<IBuyResponse | null | undefined> {
    try {
      const axiosData = await axios.post(`${this._apiEndpointStore}${this._playApiPath}/purchase`, qs.stringify({
        doc: packageName.toString(),
        ot: offerType.toString(),
        vc: versionCode.toString()
      }), this._axiosConfigForGooglePlay)

      return protoBuf.decode(axiosData.data).payload?.buyResponse
    } catch (e: any) {
      throw Error(`Make "${packageName}" Purchase Request Failed: ${(typeof e.response !== 'undefined') ? protoBuf.decode(e.response.data).commands?.displayErrorMessage : e.message}`)
    }
  }

  /**
   * Get Download Info
   *
   * @param {string} packageName App Package Name
   * @param {number | null} versionCode App Version Code (Default Latest Version Code)
   *
   * @returns {Promise<IAndroidAppDeliveryData | null>}
   */
  public async downloadInfo (packageName: string, versionCode: number | null | undefined = null): Promise<IAndroidAppDeliveryData | null> {
    try {
      const appDetails = await this.appDetails(packageName)
      const offerType = appDetails?.offer?.[0]?.offerType
      versionCode = versionCode ?? appDetails?.details?.appDetails?.versionCode

      if (offerType && versionCode) {
        await this.purchase(packageName, offerType, versionCode)
        const appDelivery = await this.appDelivery(packageName, offerType, versionCode)

        if (appDelivery?.appDeliveryData) {
          return appDelivery.appDeliveryData
        }
      }
    } catch (e: any) {
      throw Error(`Get "${packageName}" Download Info Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }

    throw Error(`Get "${packageName}" download info failed, may be the device does not support.`)
  }

  /**
   * Get Download Apk Url
   *
   * @param {string} packageName App Package Name
   * @param {number | null} versionCode App Version Code (Default Latest Version Code)
   *
   * @returns {Promise<string | null | undefined>}
   */
  public async downloadApkUrl (packageName: string, versionCode: number | null = null): Promise<string | null | undefined> {
    try {
      const downloadInfo = await this.downloadInfo(packageName, versionCode)

      return downloadInfo?.downloadUrl
    } catch (e: any) {
      throw Error(`Get "${packageName}" Download Apk Url Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Download Apk
   *
   * @param {string} packageName App Package Name
   * @param {string} outputPath Output Save Path
   * @param {number | null} versionCode App Version Code (Default Latest Version Code)
   * @param {string | null} outputFileName Output File Save Name (Default App Package Name)
   *
   * @returns {Promise<boolean>}
   */
  public async downloadApk (packageName: string, outputPath: string, versionCode: number | null = null, outputFileName: string | null = null): Promise<boolean> {
    try {
      let fileName = outputFileName ?? packageName
      if (!isExtMatch(fileName, 'apk')) {
        fileName += '.apk'
      }

      const downloadApkUrl = await this.downloadApkUrl(packageName, versionCode)
      if (downloadApkUrl) return await downloadFile(downloadApkUrl, outputPath, fileName)
    } catch (e: any) {
      throw Error(`Download "${packageName}" Apk Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }

    throw Error(`Download "${packageName}" Apk Failed.`)
  }

  /**
   * Get Split Delivery Data Info
   *
   * @param {string} packageName App Package Name
   * @param {number | null} versionCode App Version Code (Default Latest Version Code)
   *
   * @returns {Promise<ISplitDeliveryData[] | null | undefined>}
   */
  public async splitDeliveryDataInfo (packageName: string, versionCode: number | null = null): Promise<ISplitDeliveryData[] | null | undefined> {
    try {
      const downloadInfo = await this.downloadInfo(packageName, versionCode)

      return downloadInfo?.splitDeliveryData
    } catch (e: any) {
      throw Error(`Get "${packageName}" Split Delivery Data Info Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Get Download Split Apks Name And Url
   *
   * @param {string} packageName App Package Name
   * @param {number | null} versionCode App Version Code (Default Latest Version Code)
   *
   * @returns {Promise<{name: string | null | undefined, downloadUrl: string | null | undefined}[]>}
   */
  public async downloadSplitApksNameAndUrl (packageName: string, versionCode: number | null = null): Promise<{ name: string | null | undefined, downloadUrl: string | null | undefined }[]> {
    try {
      const splitDeliveryData = await this.splitDeliveryDataInfo(packageName, versionCode)

      return map(splitDeliveryData, data => {
        return {
          name: data.name,
          downloadUrl: data.downloadUrl
        }
      })
    } catch (e: any) {
      throw Error(`Get "${packageName}" Download Split Apks Name And Url Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Download Split Apks
   *
   * @param {string} packageName App Package Name
   * @param {string} outputPath Output Save Path
   * @param {number | null} versionCode App Version Code (Default Latest Version Code)
   * @param {string | null} outputFileNamePrefixe Output File Save Name Prefixe (Default App Package Name)
   *
   * @returns {Promise<boolean>}
   */
  public async downloadSplitApks (packageName: string, outputPath: string, versionCode: number | null = null, outputFileNamePrefixe: string | null = null): Promise<boolean> {
    try {
      const fileName = outputFileNamePrefixe ?? packageName

      const downloadSplitApksNameAndUrl = await this.downloadSplitApksNameAndUrl(packageName, versionCode)
      for (const data of downloadSplitApksNameAndUrl) {
        if (data.downloadUrl) return await downloadFile(data.downloadUrl, outputPath, `${fileName}-${data.name}.apk`)
      }
    } catch (e: any) {
      throw Error(`Download "${packageName}" Split Apks Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }

    throw Error(`Download "${packageName}" Split Apks Failed.`)
  }

  /**
   * Get Additional File Info
   *
   * @param {string} packageName App Package Name
   * @param {number | null} versionCode App Version Code (Default Latest Version Code)
   *
   * @returns {Promise<IAppFileMetadata[] | null | undefined>}
   */
  public async additionalFileInfo (packageName: string, versionCode: number | null = null): Promise<IAppFileMetadata[] | null | undefined> {
    try {
      const downloadInfo = await this.downloadInfo(packageName, versionCode)

      return downloadInfo?.additionalFile
    } catch (e: any) {
      throw Error(`Get "${packageName}" Additional File Info Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Get Download Additional File Urls
   *
   * @param {string} packageName App Package Name
   * @param {number | null} versionCode App Version Code (Default Latest Version Code)
   *
   * @returns {Promise<string[] | null | undefined>}
   */
  public async downloadAdditionalFileUrls (packageName: string, versionCode: number | null = null): Promise<string[] | null | undefined> {
    try {
      const additionalFileInfo = await this.additionalFileInfo(packageName, versionCode)

      return map(additionalFileInfo, 'downloadUrl') as string[] | null | undefined
    } catch (e: any) {
      throw Error(`Get "${packageName}" Download Additional File Urls Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }
  }

  /**
   * Download Additional Files
   *
   * @param {string} packageName App Package Name
   * @param {string} outputPath Output Save Path
   * @param {number | null} versionCode App Version Code (Default Latest Version Code)
   * @param {string | null} outputFileName Output File Save Name (Default App Package Name)
   *
   * @returns {Promise<boolean>}
   */
  public async downloadAdditionalFiles (packageName: string, outputPath: string, versionCode: number | null = null, outputFileName: string | null = null): Promise<boolean> {
    try {
      const fileName = outputFileName ?? packageName

      const downloadAdditionalFileUrls = await this.downloadAdditionalFileUrls(packageName, versionCode)
      if (downloadAdditionalFileUrls) {
        for (const [key, url] of downloadAdditionalFileUrls.entries()) {
          await downloadFile(url, outputPath, `${fileName}_${(key + 1)}`)
        }

        return true
      }
    } catch (e: any) {
      throw Error(`Download "${packageName}" Additional Files Failed: ${(typeof e.response !== 'undefined') ? e.response.data : e.message}`)
    }

    throw Error(`Download "${packageName}" Additional Files Failed.`)
  }
}
