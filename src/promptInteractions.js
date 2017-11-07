// @flow

import inquirer from "inquirer"

import texts from "./texts"
import type {
  T_FinalOptions,
  T_ParsedCommandOpts,
} from "./commonTypes"

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

const logOptionsInHumanFormat = (finalOptions: T_FinalOptions) => {
  console.log(texts.OPTIONS_APPLIED_CONFIRM)
  console.log(JSON.stringify(finalOptions))
}

export const confirmOptions = async (finalOptions: T_FinalOptions) => {
  logOptionsInHumanFormat(finalOptions)

  const question: T_Question = POSSIBLE_QUESTIONS.confirm()
  const answer = await inquirer.prompt([question])

  if (!answer.confirm) {
    process.exit(0)
  }
}

export const getAnswersForFinalOptions = async (parsedCommandOpts: T_ParsedCommandOpts) => {
  if (!process.stdin.isTTY) {
    return {}
  }

  const questions = buildQuestions(parsedCommandOpts)
  const answers = await inquirer.prompt(questions)

  return answers
}

// istanbul ignore else
if (global.__TEST__) {
  module.exports._test = {
    POSSIBLE_QUESTIONS,
    buildQuestions,
    confirmOptions,
    validateSearchQuestion,
  }
}
