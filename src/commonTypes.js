// @flow

export type T_ParsedCommandOpts = ExactSpreadWorkaround<{|
  searchPath: string,
  searchPattern: string,
  searchReplacement: string,
  shouldBeCaseSensitive: boolean,
  shouldBePreview: boolean,
  shouldConfirmOptions: boolean,
|}>

export type T_FinalOptions = ExactSpreadWorkaround<{|
  ...T_ParsedCommandOpts,
|}>
