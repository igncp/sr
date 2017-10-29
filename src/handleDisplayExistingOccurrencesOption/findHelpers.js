// @flow

import { readFile } from "../utils/io"

export type T_OccurrencesData = {|
  occurrencesCount: number,
  filePath: string,
|}

const getOccurrencesCount = ({
  content,
  findString,
}) => {
  const regex = new RegExp(findString, "g")
  const occurrencesCount = (content.match(regex) || []).length

  return occurrencesCount
}

type T_findOccurrencesInFile = ({|
  filePath: string,
  findString: string,
|}) => Promise<T_OccurrencesData>

export const findOccurrencesInFile: T_findOccurrencesInFile = async ({
  filePath,
  findString,
}) => {
  const fileContent = await readFile(filePath)

  const occurrencesCount = getOccurrencesCount({
    content: fileContent,
    findString,
  })

  return {
    occurrencesCount,
    filePath,
  }
}
