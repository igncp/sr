// @flow

import { replaceWithCb } from "../../replacementHelpers"
import type { T_ReplacementsCollection } from "../../commonTypes"
import {
  readFile,
  writeFile,
} from "../../utils/io"

import setupTerminalListUI from "../setupTerminalListUI/setupTerminalListUI"

import {
  createReplacementsEntriesFromReplacementsCollection,
  updateReplacementsEntriesForFilePath,
} from "./manageReplacementsEntries"
import type { T_ReplacementEntry } from "./handleReplacementsInList.types"

type T_handleReplacementsInList = ({
  searchPattern: string,
  searchReplacement: string,
  shouldBeCaseSensitive: boolean,
  getListReplacementsCollection: () => T_ReplacementsCollection,
}) => Promise<{}>

const handleReplacementsInList: T_handleReplacementsInList = ({
  getListReplacementsCollection,
  searchPattern,
  searchReplacement,
  shouldBeCaseSensitive,
}) => {
  const listReplacementsCollection = getListReplacementsCollection()
  const replacementsEntries: T_ReplacementEntry[] =
    createReplacementsEntriesFromReplacementsCollection(listReplacementsCollection)

  const getPreviewContentOnMove = async ({
    itemIndex,
  }) => {
    const {
      filePath,
      replacementIndex,
    } = replacementsEntries[itemIndex]

    let localReplacementIndex = -1

    const fileContent = await readFile(filePath)

    const newFileContent = replaceWithCb({
      searchPattern,
      shouldBeCaseSensitive,
      fileContent,
      cb: (original) => {
        localReplacementIndex++

        if (localReplacementIndex === replacementIndex) {
          return `{black-fg}{white-bg}${searchReplacement}{/white-bg}{/black-fg}`
        }

        return original
      },
    })

    return newFileContent
  }

  const onRowSelected = async ({
    itemIndex,
  }) => {
    const {
      filePath,
      replacementIndex,
    } = replacementsEntries[itemIndex]

    let localReplacementIndex = -1

    const fileContent = await readFile(filePath)

    const newFileContent = replaceWithCb({
      shouldBeCaseSensitive,
      searchPattern,
      fileContent,
      cb: (original) => {
        localReplacementIndex++

        if (localReplacementIndex === replacementIndex) {
          return searchReplacement
        }

        return original
      },
    })

    await writeFile(filePath, newFileContent)

    await updateReplacementsEntriesForFilePath({
      filePath,
      replacementsEntries,
      searchPattern,
      searchReplacement,
      shouldBeCaseSensitive,
    })
  }

  return new Promise((resolve) => {
    setupTerminalListUI({
      getPreviewContentOnMove,
      onRowSelected,
      onSuccess: resolve,
      getListRows: () => {
        return replacementsEntries.map(entry => ({
          id: entry.id,
          value: `${entry.filePath} ${entry.replacementIndex + 1} / ${entry.replacementsCount}`,
        }))
      },
    })
  })
}

export default handleReplacementsInList
