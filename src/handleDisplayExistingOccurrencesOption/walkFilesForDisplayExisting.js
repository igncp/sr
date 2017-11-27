// @flow

import walkFiles from "../utils/walkFiles"

import { findOccurrencesInFile } from "./findHelpers"
import handleOccurrencesDatas from "./handleOccurrencesDatas"

const getHandleFileFn = ({
  onNewFindPromise,
  searchReplacement,
}) => (root, stat, next) => {
  const filePath = `${root}/${stat.name}`

  const findPromise = findOccurrencesInFile({
    filePath,
    findString: searchReplacement,
  })

  onNewFindPromise(findPromise)

  next()
}

const getHandleEndFn = ({
  findPromises,
  findString,
  onFinish,
}) => async () => {
  const occurrencesDatas = await Promise.all(findPromises)

  await handleOccurrencesDatas({
    occurrencesDatas,
    findString,
  })

  onFinish()
}

type T_walkFilesForDisplayingExisting = ({|
  filesList: ?string[],
  searchPath: string,
  searchReplacement: string,
|}) => Promise<void>

const walkFilesForDisplayingExisting: T_walkFilesForDisplayingExisting = ({
  filesList,
  searchPath,
  searchReplacement,
}) => {
  return new Promise((resolve) => {
    const findPromises = []

    const onNewFindPromise = (findPromise) => {
      findPromises.push(findPromise)
    }

    const handleFile = getHandleFileFn({
      searchReplacement,
      onNewFindPromise,
    })

    const handleEnd = getHandleEndFn({
      findPromises,
      findString: searchReplacement,
      onFinish: resolve,
    })

    walkFiles({
      filesList,
      handleEnd,
      handleFile,
      walkPath: searchPath,
    })
  })
}

export default walkFilesForDisplayingExisting
