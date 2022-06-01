/**
 * Copyright 2022 GoneTone
 *
 * Google Play API (Unofficial Node.js Library)
 * https://github.com/GoneToneStudio/node-google-play-api
 *
 * @author   張文相 Wenxiang Zhang (旋風之音 GoneTone) <https://blog.reh.tw>
 * @license  MIT <https://github.com/GoneToneStudio/node-google-play-api/blob/master/LICENSE>
 *
 * File Control
 */

import path from 'path'
import fs from 'fs'
import axios from 'axios'

/**
 * Read Token
 *
 * @param {string} filePath File Path
 *
 * @returns {Promise<string>}
 */
export async function readToken (filePath: string): Promise<string> {
  try {
    const pathIsExists = await isExists(filePath)
    if (pathIsExists) {
      const data = await fs.promises.readFile(filePath, 'utf-8')
      return data.toString()
    }

    return filePath
  } catch (e: any) {
    throw Error(`Read Token Failed: ${e.message}`)
  }
}

/**
 * Write Token
 *
 * @param {string} filePath File Path
 * @param {string} token Token
 */
export async function writeToken (filePath: string, token: string): Promise<void> {
  const dirName = path.dirname(filePath)

  try {
    const pathIsExists = await isExists(dirName)
    if (!pathIsExists) {
      await fs.promises.mkdir(dirName, {
        recursive: true
      })
    }

    await fs.promises.writeFile(filePath, token)
  } catch (e: any) {
    throw Error(`Write Token Failed: ${e.message}`)
  }
}

/**
 * Whether the file or folder exists
 *
 * @param {string} path Path
 *
 * @returns {Promise<boolean>}
 */
export async function isExists (path: string): Promise<boolean> {
  let pathIsExists: boolean
  try {
    await fs.promises.stat(path)
    pathIsExists = true
  } catch (e) {
    pathIsExists = false
  }

  return pathIsExists
}

/**
 * Whether the Ext Name match
 *
 * @param {string} fileName File Name
 * @param {string} extName Ext Name
 *
 * @returns {boolean}
 */
export function isExtMatch (fileName: string, extName: string): boolean {
  return (path.extname(fileName) === `.${extName}`)
}

/**
 * Download File
 *
 * @param {string} fileUrl File Url
 * @param {string} outputPath Output Save Path
 * @param {string} outputFileName File Save Name
 *
 * @returns {Promise<boolean>}
 */
export async function downloadFile (fileUrl: string, outputPath: string, outputFileName: string): Promise<boolean> {
  const dirName = path.dirname(path.join(outputPath, outputFileName))

  const pathIsExists = await isExists(dirName)
  if (!pathIsExists) {
    await fs.promises.mkdir(dirName, {
      recursive: true
    })
  }

  const writer = fs.createWriteStream(path.format({
    dir: dirName,
    name: outputFileName
  }))

  const response = await axios({
    url: fileUrl,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      resolve(true)
    })
    writer.on('error', (e) => {
      reject(Error(`Download File Failed: ${e.message}`))
    })
  })
}
