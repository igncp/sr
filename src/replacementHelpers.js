// @flow

import {
  readFile,
  writeFile,
} from "./utils/io"

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
  searchPattern,
  searchReplacement,
  shouldBeCaseSensitive,
}) => {
  let replacementsCount = 0

  const newFileContent = replaceWithCb({
    searchPattern,
    shouldBeCaseSensitive,
    fileContent,
    cb: () => {
      replacementsCount += 1

      return searchReplacement
    },
  })

  return {
    newFileContent,
    replacementsCount,
  }
}

type T_FileReplacementData = {|
  filePath: string,
  replacementsCount: number,
|}

type T_replaceFileIfNecessary = ({
  filePath: string,
  getShouldReplaceFile: (T_FileReplacementData) => boolean,
  onFileReplaced: (T_FileReplacementData) => void,
  searchPattern: string,
  searchReplacement: string,
  shouldBeCaseSensitive: boolean,
}) => Promise<void>

export const replaceFileIfNecessary: T_replaceFileIfNecessary = async ({
  filePath,
  getShouldReplaceFile,
  onFileReplaced,
  searchPattern,
  searchReplacement,
  shouldBeCaseSensitive,
}) => {
  const fileContent = await readFile(filePath)
  const {
    replacementsCount,
    newFileContent,
  } = replace({
    fileContent,
    searchPattern,
    searchReplacement,
    shouldBeCaseSensitive,
  })

  if (fileContent !== newFileContent) {
    const fileReplacementData = {
      filePath,
      replacementsCount,
    }
    const shouldReplace = getShouldReplaceFile(fileReplacementData)

    if (!shouldReplace) {
      return
    }

    await writeFile(filePath, newFileContent)

    onFileReplaced(fileReplacementData)
  }
}

// istanbul ignore else
if (global.__TEST__) {
  module.exports._test = {
    replace,
  }
}
