/**
 * Copyright 2021 GoneTone
 *
 * Google Play API (Unofficial Node.js Library)
 * https://github.com/GoneToneStudio/node-google-play-api
 *
 * @author   張文相 Wenxiang Zhang (旋風之音 GoneTone) <https://blog.reh.tw>
 * @license  MIT <https://github.com/GoneToneStudio/node-google-play-api/blob/master/LICENSE>
 *
 * Protocol Buffers
 */

'use strict'

const ProtoBufJS = require('protobufjs')

class ProtoBuf {
  /**
   * ProtoBuf constructor.
   */
  constructor () {
    // noinspection JSUnresolvedFunction
    const builder = ProtoBufJS.loadProtoFile(require.resolve('../proto/google_play.proto'))
    this._responseWrapper = builder.build('ResponseWrapper')
    this._bulkDetailsRequest = builder.build('BulkDetailsRequest')
  }

  /**
   * Protocol Buffers Decode
   *
   * @param {ByteBuffer} data Protocol Buffers Data
   *
   * @returns {Object}
   */
  decode (data) {
    return this._responseWrapper.decode(data)
  }

  /**
   * Bulk Details Request Buffer
   *
   * @param {String} packages App Packages
   *
   * @returns {Buffer}
   */
  bulkDetailsRequest (...packages) {
    return new this._bulkDetailsRequest({
      includeChildDocs: true,
      includeDetails: true,
      DocId: packages
    }).encode().toBuffer()
  }
}

module.exports = ProtoBuf
