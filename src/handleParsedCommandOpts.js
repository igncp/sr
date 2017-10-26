// @flow

import path from "path"

import walk from "walk"

import texts from "./texts"
import { exitWithError } from "./utils/lifecycle"
import handleReplacementsInList from "./listOption/handleReplacementsInList/handleReplacementsInList"
import type {
  T_FinalOptions,
  T_ParsedCommandOpts,
} from "./commonTypes"

import { replaceFileIfNecessary } from "./replacementHelpers"
import {
  getAnswersForFinalOptions,
  confirmOptions,
} from "./promptInteractions"

type T_handleParsedCommandOpts = (opts: T_ParsedCommandOpts) => Promise<void>

const getHandleFileFn = ({
  finalOptions,
  onFileReplacementPromise,
}) => (root, stat, next) => {
  const filePath = `${root}/${stat.name}`

  const fileReplacementPromise = replaceFileIfNecessary({
    filePath,
    replacementsCollection: finalOptions.replacementsCollection,
    searchPattern: finalOptions.searchPattern,
    searchReplacement: finalOptions.searchReplacement,
    shouldBeCaseSensitive: finalOptions.shouldBeCaseSensitive,
    shouldBePreview: finalOptions.shouldBePreview,
    shouldUseList: finalOptions.shouldUseList,
  })

  onFileReplacementPromise({
    fileReplacementPromise,
  })

  next()
}

const buildFinalOptions = (parsedCommandOpts, answers): T_FinalOptions => {
  const searchPath = (parsedCommandOpts.searchPath || answers.path || "").replace(/\/$/, "")
  const replacementsCollection = []

  return {
    replacementsCollection,
    searchPath,
    searchPattern: parsedCommandOpts.searchPattern || answers.search,
    searchReplacement: parsedCommandOpts.searchReplacement || answers.replace,
    shouldBeCaseSensitive: parsedCommandOpts.shouldBeCaseSensitive,
    shouldBePreview: parsedCommandOpts.shouldBePreview,
    shouldConfirmOptions: parsedCommandOpts.shouldConfirmOptions,
    shouldUseList: parsedCommandOpts.shouldUseList,
  }
}

const validateFinalOptions = (finalOptions) => {
  if (!finalOptions.searchPath) {
    exitWithError(texts.ERRORS.MISSING_PATH)
  }
}

const getHandleEndFn = ({
  fileReplacementPromises,
  finalOptions,
}) => async () => {
  await Promise.all(fileReplacementPromises)

  if (finalOptions.shouldUseList) {
    await handleReplacementsInList({
      finalOptions,
    })
  }
}

const handleParsedCommandOpts: T_handleParsedCommandOpts = async (parsedCommandOpts) => {
  const answers = await getAnswersForFinalOptions(parsedCommandOpts)
  const finalOptions = buildFinalOptions(parsedCommandOpts, answers)

  validateFinalOptions(finalOptions)

  if (finalOptions.shouldConfirmOptions) {
    await confirmOptions(finalOptions)
  }

  const resolvedSearchPath = path.resolve(finalOptions.searchPath)

  const walker = walk.walk(resolvedSearchPath, { followLinks: false })

  const fileReplacementPromises = []

  const handleFile = getHandleFileFn({
    finalOptions,
    onFileReplacementPromise: ({
      fileReplacementPromise,
    }) => { fileReplacementPromises.push(fileReplacementPromise) },
  })

  const handleEnd = getHandleEndFn({
    finalOptions,
    fileReplacementPromises,
  })

  walker.on("file", handleFile)
  walker.on("end", handleEnd)
}

export default handleParsedCommandOpts

// istanbul ignore else
if (global.__TEST__) {
  handleParsedCommandOpts._test = {
    getHandleEndFn,
    getHandleFileFn,
  }
}
