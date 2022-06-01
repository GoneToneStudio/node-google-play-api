/**
 * Copyright 2022 GoneTone
 *
 * Google Play API (Unofficial Node.js Library)
 * https://github.com/GoneToneStudio/node-google-play-api
 *
 * @author   張文相 Wenxiang Zhang (旋風之音 GoneTone) <https://blog.reh.tw>
 * @license  MIT <https://github.com/GoneToneStudio/node-google-play-api/blob/master/LICENSE>
 *
 * Protocol Buffers
 */

import type { Reader } from 'protobufjs'
import { ResponseWrapper, BulkDetailsRequest } from '../proto/google_play'

/**
 * Protocol Buffers Decode
 *
 * @param {Reader | Uint8Array} data Protocol Buffers Data
 *
 * @returns {ResponseWrapper}
 */
export function decode (data: Reader | Uint8Array): ResponseWrapper {
  return ResponseWrapper.decode(data)
}

/**
 * Bulk Details Request Buffer
 *
 * @param {string[]} packages App Packages
 *
 * @returns {Uint8Array}
 */
export function bulkDetailsRequest (...packages: string[]): Uint8Array {
  return BulkDetailsRequest.encode({
    includeChildDocs: true,
    includeDetails: true,
    DocId: packages
  }).finish()
}
