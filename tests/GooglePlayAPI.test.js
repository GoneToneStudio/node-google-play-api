/**
 * Copyright 2021 GoneTone
 *
 * Google Play API (Unofficial Node.js Library)
 * https://github.com/GoneToneStudio/node-google-play
 *
 * @author   張文相 Wenxiang Zhang (旋風之音 GoneTone) <https://blog.reh.tw>
 * @license  MIT <https://github.com/GoneToneStudio/node-google-play/blob/master/LICENSE>
 *
 * GooglePlayAPI Test
 */

'use strict'

require('dotenv').config()

const GooglePlayAPI = require('..')

let gpAPI
test('Init', () => {
  gpAPI = new GooglePlayAPI(process.env.GOOGLE_TEST_EMAIL, process.env.GOOGLE_TEST_GFS_ID)
})

test('Google Auth', async () => {
  await gpAPI.googleAuth(process.env.GOOGLE_TEST_AUTH_TOKEN)
})

let details
test('Get App Details', async () => {
  details = await gpAPI.appDetails('com.github.android')
  expect(typeof details).toBe('object')
})

test('Get App Details Title', async () => {
  expect(typeof details.title).toBe('string')
})

test('Get App Details Description Html', async () => {
  // noinspection JSUnresolvedVariable
  expect(typeof details.descriptionHtml).toBe('string')
})

test('Get App Details Developer Name', async () => {
  // noinspection JSUnresolvedVariable
  expect(typeof details.details.appDetails.developerName).toBe('string')
})

test('Get App Details Version Code', async () => {
  // noinspection JSUnresolvedVariable
  expect(typeof details.details.appDetails.versionCode).toBe('number')
})

test('Get App Details Version String', async () => {
  // noinspection JSUnresolvedVariable
  expect(typeof details.details.appDetails.versionString).toBe('string')
})

test('Get App Details Package Name', async () => {
  // noinspection JSUnresolvedVariable
  expect(typeof details.details.appDetails.packageName).toBe('string')
})

test('Get App Details Share Url', async () => {
  // noinspection JSUnresolvedVariable
  expect(typeof details.shareUrl).toBe('string')
})

test('Get Bulk Details', async () => {
  const bulkDetails = await gpAPI.bulkDetails('com.github.android', 'com.twitter.android', 'com.facebook.katana')
  expect(typeof bulkDetails).toBe('object')
})

test('App Search', async () => {
  const search = await gpAPI.search('GitHub')
  expect(typeof search).toBe('object')
})

test('Get Download Info', async () => {
  const downloadInfo = await gpAPI.downloadInfo('com.github.android')
  expect(typeof downloadInfo).toBe('object')
}, 100000)

test('Get Download Apk Url', async () => {
  const downloadApkUrl = await gpAPI.downloadApkUrl('com.github.android')
  expect(typeof downloadApkUrl).toBe('string')
}, 100000)

test('Get Additional File Info', async () => {
  const additionalFileInfo = await gpAPI.additionalFileInfo('com.github.android')
  expect(typeof additionalFileInfo).toBe('object')
}, 100000)

test('Get Download Additional File Urls', async () => {
  const downloadAdditionalFileUrls = await gpAPI.downloadAdditionalFileUrls('com.github.android')
  expect(typeof downloadAdditionalFileUrls).toBe('object')
}, 100000)
