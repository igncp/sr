// @flow

import {
  readFile,
  writeFile,
} from "./utils/io"

type T_ReplaceWithCbFn = ({|
  offset: number,
  originalStr: string,
  replaceArgs: any[],
  replacementIndex: number,
|}) => string

type T_replaceWithCb = ({
  shouldBeCaseSensitive: boolean,
  searchPattern: string,
  fileContent: string,
  cb: T_ReplaceWithCbFn,
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

  let replacementIndex = -1

  return fileContent.replace(regex, (...replaceArgs) => {
    replacementIndex++

    const offset: number = (replaceArgs.slice(-2)[0]: any)
    const [originalStr] = replaceArgs

    return cb({
      offset,
      originalStr,
      replaceArgs,
      replacementIndex,
    })
  })
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
  onFileReplaced?: (T_FileReplacementData) => void,
  searchPattern: string,
  searchReplacement: string,
  shouldBeCaseSensitive: boolean,
}) => Promise<T_FileReplacementData>

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

  const fileReplacementData = {
    filePath,
    replacementsCount,
  }

  if (fileContent !== newFileContent) {
    const shouldReplace = getShouldReplaceFile(fileReplacementData)

    if (shouldReplace) {
      await writeFile(filePath, newFileContent)

      if (onFileReplaced) {
        onFileReplaced(fileReplacementData)
      }
    }
  }

  return fileReplacementData
}

// istanbul ignore else
if (global.__TEST__) {
  module.exports._test = {
    replace,
  }
}
