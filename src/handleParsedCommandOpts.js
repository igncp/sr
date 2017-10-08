// @flow

import path from "path"

import walk from "walk"
import inquirer from "inquirer"

import texts from "./texts"
import {
  exitWithError,
} from "./helpers"
import type {
  T_FinalOptions,
  T_ParsedCommandOpts,
} from "./commonTypes"

import replaceFileIfNecessary from "./replaceFileIfNecessary"

type T_handleParsedCommandOpts = (opts: T_ParsedCommandOpts) => Promise<void>

type T_QuestionCommon = ExactSpreadWorkaround<{|
  validate?: (v: any) => string | boolean,
  default?: string | boolean,
  message: string,
|}>

type T_QuestionInputNames = 'path' | 'search' | 'replace'
type T_QuestionConfirmNames = 'confirm'

type T_Question = ExactSpreadWorkaround<{|
  name: T_QuestionInputNames,
  type: 'input',
  ...T_QuestionCommon,
|}> | ExactSpreadWorkaround<{|
  name: T_QuestionConfirmNames,
  type: 'confirm',
  ...T_QuestionCommon,
|}>

const getHandleFileFn = (finalOptions: T_FinalOptions) => (root, stat, next) => {
  const filePath = `${root}/${stat.name}`

  replaceFileIfNecessary({
    filePath,
    finalOptions,
  })

  next()
}

const validateSearchQuestion = (value) => {
  if (value.trim() !== "") {
    return true
  }

  return texts.ERRORS.MISSING_SEARCH
}

const POSSIBLE_QUESTIONS: {[T_QuestionConfirmNames | T_QuestionInputNames]: () => T_Question} = {
  path: () => ({
    type: "input",
    name: "path",
    message: texts.QUESTIONS.PATH,
    default: ".",
  }),
  search: () => ({
    type: "input",
    name: "search",
    message: texts.QUESTIONS.SEARCH,
    validate: validateSearchQuestion,
  }),
  replace: () => ({
    type: "input",
    name: "replace",
    message: texts.QUESTIONS.REPLACE,
  }),
  confirm: () => ({
    type: "confirm",
    name: "confirm",
    message: texts.QUESTIONS.CONFIRM,
    default: false,
  }),
}

const buildQuestions = (parsedCommandOpts) => {
  const questions: Array<T_Question> = []

  if (!parsedCommandOpts.searchPath) {
    questions.push(POSSIBLE_QUESTIONS.path())
  }

  if (!parsedCommandOpts.searchPattern) {
    questions.push(POSSIBLE_QUESTIONS.search())
  }

  if (!parsedCommandOpts.searchReplacement) {
    questions.push(POSSIBLE_QUESTIONS.replace())
  }

  return questions
}

const buildFinalOptions = (parsedCommandOpts, answers): T_FinalOptions => {
  const searchPath = (parsedCommandOpts.searchPath || answers.path || "").replace(/\/$/, "")

  return {
    searchPath,
    searchPattern: parsedCommandOpts.searchPattern || answers.search,
    searchReplacement: parsedCommandOpts.searchReplacement || answers.replace,
    shouldBeCaseSensitive: parsedCommandOpts.shouldBeCaseSensitive,
    shouldBePreview: parsedCommandOpts.shouldBePreview,
    shouldConfirmOptions: parsedCommandOpts.shouldConfirmOptions,
  }
}

const validateFinalOptions = (finalOptions) => {
  if (!finalOptions.searchPath) {
    exitWithError(texts.ERRORS.MISSING_PATH)
  }
}

const logOptionsInHumanFormat = (finalOptions: T_FinalOptions) => {
  console.log(texts.OPTIONS_APPLIED_CONFIRM)
  console.log(JSON.stringify(finalOptions))
}

const confirmOptions = async (finalOptions) => {
  logOptionsInHumanFormat(finalOptions)

  const question: T_Question = POSSIBLE_QUESTIONS.confirm()
  const answer = await inquirer.prompt([question])

  if (!answer.confirm) {
    process.exit(0)
  }
}

const handleParsedCommandOpts: T_handleParsedCommandOpts = async (parsedCommandOpts) => {
  const questions = buildQuestions(parsedCommandOpts)
  const answers = await inquirer.prompt(questions)
  const finalOptions = buildFinalOptions(parsedCommandOpts, answers)

  validateFinalOptions(finalOptions)

  if (finalOptions.shouldConfirmOptions) {
    await confirmOptions(finalOptions)
  }

  const resolvedSearchPath = path.resolve(finalOptions.searchPath)
  const walker = walk.walk(resolvedSearchPath, { followLinks: false })
  const handleFile = getHandleFileFn(finalOptions)

  walker.on("file", handleFile)
}

export default handleParsedCommandOpts

// istanbul ignore else
if (global.__TEST__) {
  handleParsedCommandOpts._test = {
    POSSIBLE_QUESTIONS,
    buildQuestions,
    confirmOptions,
  }
}
