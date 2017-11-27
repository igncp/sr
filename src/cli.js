#!/usr/bin/env node
// @flow

import program from "commander"

import handleParsedCommandOpts from "./handleParsedCommandOpts"
import { exitWithError } from "./utils/lifecycle"
import texts from "./texts"
import pjson from "../package"
import logUnhandledRejections from "./logUnhandledRejections"
import { readFile } from "./utils/io"

import type { T_ParsedCommandOpts } from "./commonTypes"

const getFilesList = async (filesListPath): Promise<string[]> => {
  const filesListContent = await readFile(filesListPath)

  return filesListContent.split("\n").filter(f => !!f.trim())
}

const extractCommandOpts = async (parsedProgram): Promise<T_ParsedCommandOpts> => {
  const searchPath = parsedProgram.args[0]
  let searchPattern = parsedProgram.args[1]

  if (searchPattern && parsedProgram.delimiters) {
    searchPattern = `\\b${searchPattern}\\b`
  }

  const filesList = parsedProgram.filesListPath
    ? await getFilesList(searchPath)
    : null

  return {
    filesList,
    searchPath,
    searchPattern,
    searchReplacement: parsedProgram.args[2],
    shouldBeCaseSensitive: !parsedProgram.caseInsensitive,
    shouldBePreview: !!parsedProgram.preview,
    shouldConfirmOptions: !!parsedProgram.confirm,
    shouldDisplayExisting: !!parsedProgram.existing,
    shouldUseList: !parsedProgram.disableList,
  }
}

const main = async () => {
  logUnhandledRejections(process)

  if (!process.stdin.isTTY) {
    exitWithError(texts.ERRORS.PIPE_UNSUPPORTED)
  }

  program
    .version(pjson.version)
    .usage("[options] <searchPath searchPattern replacementString>")
    .option("-i, --case-insensitive", "case insensitive search [default=false]")
    .option("-p, --preview", "preview results without modifying files (not applicable to list) [default=false]")
    .option("-c, --confirm", "confirm selection of options [default=false]")
    .option("-e, --existing", "show existing matches of the replacement string, in a list")
    .option("-d, --delimiters", "adds word delimeters to the search pattern [default=false]")
    .option("-f, --files-list-path", "opens this file and uses the files paths inside")
    .option("--disable-list", "disable list to select replacements interactively")
    .parse(process.argv)

  const commandOpts = await extractCommandOpts(program)

  handleParsedCommandOpts(commandOpts)
}

// istanbul ignore else
if (global.__TEST__) {
  module.exports = main
} else {
  main()
}
