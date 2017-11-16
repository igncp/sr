#!/usr/bin/env node
// @flow

import program from "commander"
import getStdin from "get-stdin"

import handleParsedCommandOpts from "./handleParsedCommandOpts"
import pjson from "../package"
import logUnhandledRejections from "./logUnhandledRejections"

import type { T_ParsedCommandOpts } from "./commonTypes"

const extractCommandOpts = (parsedProgram, filesListStr): T_ParsedCommandOpts => {
  const filesList = typeof filesListStr === 'string'
    ? filesListStr.split('\n').filter(s => !!s.trim())
    : null
  let searchPattern = filesList ? parsedProgram.args[0] : parsedProgram.args[1]

  if (searchPattern && parsedProgram.delimiters) {
    searchPattern = `\\b${searchPattern}\\b`
  }

  return {
    filesList,
    searchPath: filesList ? '' : parsedProgram.args[0],
    searchPattern,
    searchReplacement: filesList ? parsedProgram.args[1] : parsedProgram.args[2],
    shouldBeCaseSensitive: !parsedProgram.caseInsensitive,
    shouldBePreview: !!parsedProgram.preview,
    shouldConfirmOptions: !!parsedProgram.confirm,
    shouldDisplayExisting: !!parsedProgram.existing,
    shouldUseList: !parsedProgram.disableList,
  }
}

const main = async () => {
  logUnhandledRejections(process)

  const filesListStr = process.stdin.isTTY
    ? null
    : await getStdin()

  program
    .version(pjson.version)
    .usage("[options] <searchPath searchPattern replacementString>")
    .option("-i, --case-insensitive", "case insensitive search [default=false]")
    .option("-p, --preview", "preview results without modifying files (not applicable to list) [default=false]")
    .option("-c, --confirm", "confirm selection of options [default=false]")
    .option("-e, --existing", "show existing matches of the replacement string, in a list")
    .option("-d, --delimiters", "adds word delimeters to the search pattern [default=false]")
    .option("--disable-list", "disable list to select replacements interactively")
    .parse(process.argv)

  const commandOpts = extractCommandOpts(program, filesListStr)

  // validateCommandOpts(commandOpts)

  handleParsedCommandOpts(commandOpts)
}

// istanbul ignore else
if (global.__TEST__) {
  module.exports = main
} else {
  main()
}
