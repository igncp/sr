// @flow

import path from "path"
import chalk from "chalk"

import walk from "walk"

import texts from "./texts"
import handleReplacementsInList from "./listOption/handleReplacementsInList/handleReplacementsInList"
import type { T_FinalOptions } from "./commonTypes"

import { replaceFileIfNecessary } from "./replacementHelpers"

const getHandleFileFn = ({
  finalOptions,
  onFileReplacementPromise,
  onListReplacementFound,
}) => (root, stat, next) => {
  const filePath = `${root}/${stat.name}`

  const getShouldReplaceFile = ({
    replacementsCount,
  }) => {
    if (finalOptions.shouldUseList) {
      onListReplacementFound({
        filePath,
        replacementsCount,
      })

      return false
    }

    if (finalOptions.shouldBePreview) {
      console.log(chalk.green(`${texts.FILE_UPDATED_PREVIEW} (x${replacementsCount}) ${filePath}`))

      return false
    }

    return true
  }

  const onFileReplaced = ({
    replacementsCount,
  }) => {
    console.log(chalk.green(`${texts.FILE_UPDATED} (x${replacementsCount}) ${filePath}`))
  }

  const fileReplacementPromise = replaceFileIfNecessary({
    filePath,
    getShouldReplaceFile,
    onFileReplaced,
    searchPattern: finalOptions.searchPattern,
    searchReplacement: finalOptions.searchReplacement,
    shouldBeCaseSensitive: finalOptions.shouldBeCaseSensitive,
  })

  onFileReplacementPromise({
    fileReplacementPromise,
  })

  next()
}

const getHandleEndFn = ({
  fileReplacementPromises,
  finalOptions,
  getListReplacementsCollection,
}) => async () => {
  await Promise.all(fileReplacementPromises)

  if (finalOptions.shouldUseList) {
    await handleReplacementsInList({
      finalOptions,
      getListReplacementsCollection,
    })
  }
}

type T_walkFilesForReplacements = (T_FinalOptions) => Promise<void>

const walkFilesForReplacements: T_walkFilesForReplacements = async (finalOptions) => {
  const resolvedSearchPath = path.resolve(finalOptions.searchPath)

  const walker = walk.walk(resolvedSearchPath, { followLinks: false })

  const fileReplacementPromises = []
  const listReplacementsCollection = []

  const onFileReplacementPromise = ({
    fileReplacementPromise,
  }) => {
    fileReplacementPromises.push(fileReplacementPromise)
  }

  const onListReplacementFound = (listReplacementsItem) => {
    listReplacementsCollection.push(listReplacementsItem)
  }

  const getListReplacementsCollection = () => listReplacementsCollection

  const handleFile = getHandleFileFn({
    finalOptions,
    onFileReplacementPromise,
    onListReplacementFound,
  })

  const handleEnd = getHandleEndFn({
    finalOptions,
    fileReplacementPromises,
    getListReplacementsCollection,
  })

  walker.on("file", handleFile)
  walker.on("end", handleEnd)
}

export default walkFilesForReplacements

// istanbul ignore else
if (global.__TEST__) {
  walkFilesForReplacements._test = {
    getHandleEndFn,
    getHandleFileFn,
  }
}
