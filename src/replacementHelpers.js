// @flow

import chalk from "chalk"

import texts from "./texts"
import {
  readFile,
  writeFile,
} from "./utils/io"

import type { T_FinalOptions } from "./commonTypes"

type T_replaceWithCb = ({
  shouldBeCaseSensitive: boolean,
  searchPattern: string,
  fileContent: string,
  cb: Function,
}) => string

export const replaceWithCb: T_replaceWithCb = ({
  shouldBeCaseSensitive,
  searchPattern,
  fileContent,
  cb,
}) => {
  const defaultOpts = "mg"
  const regexpOpts = shouldBeCaseSensitive ? defaultOpts : `i${defaultOpts}`
  const regex = new RegExp(searchPattern, regexpOpts)

  return fileContent.replace(regex, cb)
}

const replace = ({
  fileContent,
  finalOptions,
}) => {
  let replacementsCount = 0

  const newFileContent = replaceWithCb({
    searchPattern: finalOptions.searchPattern,
    shouldBeCaseSensitive: finalOptions.shouldBeCaseSensitive,
    fileContent,
    cb: () => {
      replacementsCount += 1

      return finalOptions.searchReplacement
    },
  })

  return {
    newFileContent,
    replacementsCount,
  }
}

type T_replaceFileIfNecessary = ({
  filePath: string,
  finalOptions: T_FinalOptions,
}) => Promise<void>

export const replaceFileIfNecessary: T_replaceFileIfNecessary = async ({
  filePath,
  finalOptions,
}) => {
  const fileContent = await readFile(filePath)
  const {
    replacementsCount,
    newFileContent,
  } = replace({
    fileContent,
    finalOptions,
  })

  if (fileContent !== newFileContent) {
    if (finalOptions.shouldUseList) {
      finalOptions.replacementsCollection.push({
        filePath,
        replacementsCount,
      })

      return
    }

    if (finalOptions.shouldBePreview) {
      console.log(chalk.green(`${texts.FILE_UPDATED_PREVIEW} (x${replacementsCount}) ${filePath}`))

      return
    }

    await writeFile(filePath, newFileContent)

    console.log(chalk.green(`${texts.FILE_UPDATED} (x${replacementsCount}) ${filePath}`))
  }
}

// istanbul ignore else
if (global.__TEST__) {
  module.exports._test = {
    replace,
  }
}
