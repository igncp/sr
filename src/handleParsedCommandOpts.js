// @flow

import texts from "./texts"
import { exitWithError } from "./utils/lifecycle"
import type {
  T_FinalOptions,
  T_ParsedCommandOpts,
} from "./commonTypes"

import {
  getAnswersForFinalOptions,
  confirmOptions,
} from "./promptInteractions"
import walkFilesForReplacements from "./walkFilesForReplacements"
import walkFilesForDisplayingExisting from "./handleDisplayExistingOccurrencesOption/walkFilesForDisplayExisting"

type T_handleParsedCommandOpts = (opts: T_ParsedCommandOpts) => Promise<void>

const buildFinalOptions = (parsedCommandOpts, answers): T_FinalOptions => {
  const searchPath = (parsedCommandOpts.searchPath || answers.path || "").replace(/\/$/, "")

  return {
    filesList: parsedCommandOpts.filesList,
    searchPath,
    searchPattern: parsedCommandOpts.searchPattern || answers.search,
    searchReplacement: parsedCommandOpts.searchReplacement || answers.replace,
    shouldBeCaseSensitive: parsedCommandOpts.shouldBeCaseSensitive,
    shouldBePreview: parsedCommandOpts.shouldBePreview,
    shouldConfirmOptions: parsedCommandOpts.shouldConfirmOptions,
    shouldDisplayExisting: parsedCommandOpts.shouldDisplayExisting,
    shouldUseList: parsedCommandOpts.shouldUseList,
  }
}

const validateFinalOptions = (finalOptions) => {
  if (!finalOptions.searchPath && process.stdin.isTTY) {
    exitWithError(texts.ERRORS.MISSING_PATH)
  }
}

const handleParsedCommandOpts: T_handleParsedCommandOpts = async (parsedCommandOpts) => {
  const answers = await getAnswersForFinalOptions(parsedCommandOpts)
  const finalOptions = buildFinalOptions(parsedCommandOpts, answers)

  validateFinalOptions(finalOptions)

  if (finalOptions.shouldConfirmOptions) {
    await confirmOptions(finalOptions)
  }

  if (finalOptions.shouldDisplayExisting) {
    await walkFilesForDisplayingExisting({
      filesList: finalOptions.filesList,
      searchPath: finalOptions.searchPath,
      searchReplacement: finalOptions.searchReplacement,
    })
  }

  await walkFilesForReplacements(finalOptions)
}

export default handleParsedCommandOpts
