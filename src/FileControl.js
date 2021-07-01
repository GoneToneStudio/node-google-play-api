/**
 * Copyright 2021 GoneTone
 *
 * Google Play API (Unofficial Node.js Library)
 * https://github.com/GoneToneStudio/node-google-play
 *
 * @author   張文相 Wenxiang Zhang (旋風之音 GoneTone) <https://blog.reh.tw>
 * @license  MIT <https://github.com/GoneToneStudio/node-google-play/blob/master/LICENSE>
 *
 * File Control
 */

'use strict'

const path = require('path')
const fs = require('fs')
const axios = require('axios')

class FileControl {
  /**
   * Read Token
   *
   * @param {String} filePath File Path
   *
   * @returns {Promise<string>}
   */
  static async readToken (filePath) {
    try {
      const pathIsExists = await FileControl.isExists(filePath)
      if (pathIsExists) {
        const data = await fs.promises.readFile(filePath, 'utf-8')
        return data.toString()
      }

      return filePath
    } catch (e) {
      throw Error(`Read Token Failed: ${e.message}`)
    }
  }

  /**
   * Write Token
   *
   * @param {String} filePath File Path
   * @param {String} token Token
   */
  static async writeToken (filePath, token) {
    const dirName = path.dirname(filePath)

    try {
      const pathIsExists = await FileControl.isExists(dirName)
      if (!pathIsExists) {
        await fs.promises.mkdir(dirName, {
          recursive: true
        })
      }

      await fs.promises.writeFile(filePath, token)
    } catch (e) {
      throw Error(`Write Token Failed: ${e.message}`)
    }
  }

  /**
   * Whether the file or folder exists
   *
   * @param {String} path Path
   *
   * @returns {Promise<boolean>}
   */
  static async isExists (path) {
    let pathIsExists
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
   * @param {String} fileName File Name
   * @param {String} extName Ext Name
   *
   * @returns {boolean}
   */
  static isExtMatch (fileName, extName) {
    return (path.extname(fileName) === `.${extName}`)
  }

  /**
   * Download File
   *
   * @param {String} fileUrl File Url
   * @param {String} outputPath Output Save Path
   * @param {String} outputFileName File Save Name
   *
   * @returns {Promise<Boolean>}
   */
  static async downloadFile (fileUrl, outputPath, outputFileName) {
    const dirName = path.dirname(path.join(outputPath, outputFileName))

    const pathIsExists = await FileControl.isExists(dirName)
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
}

module.exports = FileControl
