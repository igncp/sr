// @flow

import walk from "walk"
import chalk from "chalk"
import inquirer from "inquirer"

import texts from "./texts"
import {
  readFile,
  writeFile,
  exitWithError,
} from "./helpers"

export type T_ParsedCommandOpts = ExactSpreadWorkaround<{|
  searchPath: string,
  searchPattern: string,
  searchReplacement: string,
  shouldBeCaseSensitive: boolean,
  shouldBePreview: boolean,
  shouldConfirmOptions: boolean,
|}>

type T_handleParsedCommandOpts = (opts: T_ParsedCommandOpts) => Promise<void>

type T_FinalOptions = ExactSpreadWorkaround<{|
  ...T_ParsedCommandOpts,
|}>

type T_QuestionCommon = ExactSpreadWorkaround<{|
  validate?: (v: any) => string | boolean,
  default?: string | boolean,
  message: string,
|}>

type T_Question = ExactSpreadWorkaround<{|
  name: 'path' | 'search' | 'replace',
  type: 'input',
  ...T_QuestionCommon,
|}> | ExactSpreadWorkaround<{|
  name: 'confirm',
  type: 'confirm',
  ...T_QuestionCommon,
|}>

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

const replaceFileIfNecessary = async ({
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

const getHandleFileFn = (finalOptions: T_FinalOptions) => (root, stat, next) => {
  const filePath = `${root}/${stat.name}`

  replaceFileIfNecessary({
    filePath,
    finalOptions,
  })

  next()
}

const buildQuestions = (parsedCommandOpts) => {
  const questions: Array<T_Question> = []

  if (!parsedCommandOpts.searchPath) {
    questions.push({
      type: "input",
      name: "path",
      message: texts.QUESTIONS.PATH,
      default: ".",
    })
  }

  if (!parsedCommandOpts.searchPattern) {
    questions.push({
      type: "input",
      name: "search",
      message: texts.QUESTIONS.SEARCH,
      validate: (value) => {
        if (value.trim() !== "") {
          return true
        }

        return texts.ERRORS.MISSING_SEARCH
      },
    })
  }

  if (!parsedCommandOpts.searchReplacement) {
    questions.push({
      type: "input",
      name: "replace",
      message: texts.QUESTIONS.REPLACE,
    })
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

  const question: T_Question = {
    type: "confirm",
    name: "confirm",
    message: texts.QUESTIONS.CONFIRM,
    default: false,
  }
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

  const walker = walk.walk(finalOptions.searchPath, { followLinks: false })
  const handleFile = getHandleFileFn(finalOptions)

  walker.on("file", handleFile)
}

export default handleParsedCommandOpts
