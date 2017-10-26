// @flow

export type T_ParsedCommandOpts = ExactSpreadWorkaround<{|
  searchPath: string,
  searchPattern: string,
  searchReplacement: string,
  shouldBeCaseSensitive: boolean,
  shouldBePreview: boolean,
  shouldConfirmOptions: boolean,
  shouldUseList: boolean,
|}>

export type T_ReplacementsCollection = Array<{|
  replacementsCount: number,
  filePath: string,
|}>

export type T_FinalOptions = ExactSpreadWorkaround<{|
  ...T_ParsedCommandOpts,
  replacementsCollection: T_ReplacementsCollection,
|}>
