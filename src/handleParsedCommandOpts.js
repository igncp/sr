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

const getHandleFileFn = (finalOptions: T_FinalOptions) => (root, stat, next) => {
  const filePath = `${root}/${stat.name}`

  const promise = replaceFileIfNecessary({
    filePath,
    finalOptions,
  })

  finalOptions.replacementsPromises.push(promise)

  next()
}

const buildFinalOptions = (parsedCommandOpts, answers): T_FinalOptions => {
  const searchPath = (parsedCommandOpts.searchPath || answers.path || "").replace(/\/$/, "")
  const replacementsCollection = []
  const replacementsPromises = []

  return {
    replacementsCollection,
    replacementsPromises,
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

const getHandleEndFn = finalOptions => async () => {
  await Promise.all(finalOptions.replacementsPromises)

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
  const handleFile = getHandleFileFn(finalOptions)
  const handleEnd = getHandleEndFn(finalOptions)

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
