// @flow

import { replaceWithCb } from "../../replacementHelpers"
import type {
  T_FinalOptions,
  T_ReplacementsCollection,
} from "../../commonTypes"
import {
  readFile,
  writeFile,
} from "../../utils/io"

import setupTerminalListUI from "../setupTerminalListUI/setupTerminalListUI"

import {
  createReplacementEntriesFromReplacementsCollection,
  resetReplacementIndex,
} from "./handleReplacementsInListHelpers"
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
    createReplacementEntriesFromReplacementsCollection(listReplacementsCollection)

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
    removeItem,
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

    replacementsEntries.splice(itemIndex, 1)

    await removeItem()

    resetReplacementIndex({
      replacementsEntries,
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
