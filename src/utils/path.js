// @flow

import path from "path"

type T_getDisplayedRelativePath = (string) => string

export const getDisplayedRelativePath: T_getDisplayedRelativePath = (absolutePath) => {
  return path.relative(process.cwd(), absolutePath)
}
