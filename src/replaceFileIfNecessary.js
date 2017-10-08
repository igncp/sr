// @flow

import chalk from "chalk"

import texts from "./texts"
import {
  readFile,
  writeFile,
} from "./helpers"

import type { T_FinalOptions } from "./commonTypes"

const replace = ({
  fileContent,
  finalOptions,
}) => {
  const regexpOpts = `g${finalOptions.shouldBeCaseSensitive ? "" : "i"}`
  const regex = new RegExp(finalOptions.searchPattern, regexpOpts)

  let replacementsCount = 0

  const newFileContent = fileContent.replace(regex, () => {
    replacementsCount += 1

    return finalOptions.searchReplacement
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

const replaceFileIfNecessary: T_replaceFileIfNecessary = async ({
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
    if (finalOptions.shouldBePreview) {
      console.log(chalk.green(`${texts.FILE_UPDATED_PREVIEW} (x${replacementsCount}) ${filePath}`))
    } else {
      await writeFile(filePath, newFileContent)

      console.log(chalk.green(`${texts.FILE_UPDATED} (x${replacementsCount}) ${filePath}`))
    }
  }
}

// istanbul ignore else
if (global.__TEST__) {
  replaceFileIfNecessary._test = {
    replace,
  }
}

export default replaceFileIfNecessary
