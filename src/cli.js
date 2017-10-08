#!/usr/bin/env node
// @flow

import program from "commander"

import handleParsedCommandOpts from "./handleParsedCommandOpts"
import pjson from "../package"

import type { T_ParsedCommandOpts } from "./handleParsedCommandOpts"

const extractCommandOpts = (parsedProgram): T_ParsedCommandOpts => {
  return {
    searchPath: parsedProgram.args[0],
    searchPattern: parsedProgram.args[1],
    searchReplacement: parsedProgram.args[2],
    shouldBeCaseSensitive: !parsedProgram.caseInsensitive,
    shouldBePreview: !!parsedProgram.preview,
    shouldConfirmOptions: !!parsedProgram.confirm,
  }
}

const main = () => {
  program
    .version(pjson.version)
    .usage("[options] <searchPath searchPattern replacementString>")
    .option("-i, --case-insensitive", "case insensitive search [default=false]")
    .option("-p, --preview", "preview results without modifying files [default=false]")
    .option("-c, --confirm", "confirm selection of options [default=false]")
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
