// @flow

import fs from "fs"

export const readFile = (filePath: string): Promise<string> => {
  return new Promise((resolve) => {
    fs.readFile(filePath, "utf-8", (err, content) => {
      resolve(content || "")
    })
  })
}

export const writeFile = (filePath: string, fileContent: string): Promise<*> => {
  return new Promise((resolve) => {
    fs.writeFile(filePath, fileContent, resolve)
  })
}
