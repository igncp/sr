#!/usr/bin/env node
// @flow

import program from "commander"

import handleParsedCommandOpts from "./handleParsedCommandOpts"
import pjson from "../package"
import logUnhandledRejections from "./logUnhandledRejections"

import type { T_ParsedCommandOpts } from "./commonTypes"

const extractCommandOpts = (parsedProgram): T_ParsedCommandOpts => {
  let searchPattern = parsedProgram.args[1]

  if (searchPattern && parsedProgram.delimiters) {
    searchPattern = `\\b${searchPattern}\\b`
  }

  return {
    searchPath: parsedProgram.args[0],
    searchPattern,
    searchReplacement: parsedProgram.args[2],
    shouldBeCaseSensitive: !parsedProgram.caseInsensitive,
    shouldBePreview: !!parsedProgram.preview,
    shouldConfirmOptions: !!parsedProgram.confirm,
    shouldDisplayExisting: !!parsedProgram.existing,
    shouldUseList: !parsedProgram.disableList,
  }
}

const main = () => {
  logUnhandledRejections(process)

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

  const commandOpts = extractCommandOpts(program)

  // validateCommandOpts(commandOpts)

  handleParsedCommandOpts(commandOpts)
}

// istanbul ignore else
if (global.__TEST__) {
  module.exports = main
} else {
  main()
}
