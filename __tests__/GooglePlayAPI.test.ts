/**
 * Copyright 2022 GoneTone
 *
 * Google Play API (Unofficial Node.js Library)
 * https://github.com/GoneToneStudio/node-google-play-api
 *
 * @author   張文相 Wenxiang Zhang (旋風之音 GoneTone) <https://blog.reh.tw>
 * @license  MIT <https://github.com/GoneToneStudio/node-google-play-api/blob/master/LICENSE>
 *
 * GooglePlayAPI Test
 */

import dotenv from 'dotenv'
import { GooglePlayAPI } from '../src'

dotenv.config()

describe('GooglePlayAPI', () => {
  let gpAPI: GooglePlayAPI
  test('Init', () => {
    gpAPI = new GooglePlayAPI(process.env.GOOGLE_TEST_EMAIL as string, process.env.GOOGLE_TEST_GSF_ID as string)
  })

  test('Google Auth', async () => {
    await gpAPI.googleAuth(process.env.GOOGLE_TEST_AUTH_TOKEN as string)
  })

  let details: any
  test('Get App Details', async () => {
    details = await gpAPI.appDetails('com.github.android')
    expect(typeof details === 'object').toBe(true)
  })

  test('Get App Details Title', async () => {
    expect(typeof details.title === 'string' && details.title !== '').toBe(true)
  })

  test('Get App Details Description Html', async () => {
    expect(typeof details.descriptionHtml === 'string' && details.descriptionHtml !== '').toBe(true)
  })

  test('Get App Details Developer Name', async () => {
    expect(typeof details.details.appDetails.developerName === 'string' && details.details.appDetails.developerName !== '').toBe(true)
  })

  test('Get App Details Version Code', async () => {
    expect(typeof details.details.appDetails.versionCode === 'number').toBe(true)
  })

  test('Get App Details Version String', async () => {
    expect(typeof details.details.appDetails.versionString === 'string' && details.details.appDetails.versionString !== '').toBe(true)
  })

  test('Get App Details Package Name', async () => {
    expect(typeof details.details.appDetails.packageName === 'string' && details.details.appDetails.packageName !== '').toBe(true)
  })

  test('Get App Details Share Url', async () => {
    expect(typeof details.shareUrl === 'string' && details.shareUrl !== '').toBe(true)
  })

  test('Get Bulk Details', async () => {
    const bulkDetails = await gpAPI.bulkDetails('com.github.android', 'com.twitter.android', 'com.facebook.katana')
    expect(typeof bulkDetails === 'object').toBe(true)
  })

  test('App Search', async () => {
    const search = await gpAPI.search('GitHub')
    expect(typeof search === 'object').toBe(true)
  })

  test('Get Download Info', async () => {
    const downloadInfo = await gpAPI.downloadInfo('com.github.android')
    expect(typeof downloadInfo === 'object').toBe(true)
  }, 100000)

  test('Get Download Apk Url', async () => {
    const downloadApkUrl = await gpAPI.downloadApkUrl('com.github.android')
    expect(typeof downloadApkUrl === 'string' && downloadApkUrl !== '').toBe(true)
  }, 100000)

  test('Get Split Delivery Data Info', async () => {
    const splitDeliveryDataInfo = await gpAPI.splitDeliveryDataInfo('com.supercell.clashofclans')
    expect(typeof splitDeliveryDataInfo === 'object').toBe(true)
  }, 100000)

  test('Get Download Split Apks Name And Url', async () => {
    const downloadSplitApksNameAndUrl = await gpAPI.downloadSplitApksNameAndUrl('com.supercell.clashofclans')
    expect(typeof downloadSplitApksNameAndUrl === 'object').toBe(true)
  }, 100000)

  test('Get Additional File Info', async () => {
    const additionalFileInfo = await gpAPI.additionalFileInfo('com.github.android')
    expect(typeof additionalFileInfo === 'object').toBe(true)
  }, 100000)

  test('Get Download Additional File Urls', async () => {
    const downloadAdditionalFileUrls = await gpAPI.downloadAdditionalFileUrls('com.github.android')
    expect(typeof downloadAdditionalFileUrls === 'object').toBe(true)
  }, 100000)
})
