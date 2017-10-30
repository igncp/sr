// @flow

import { replaceWithCb } from "../../replacementHelpers"
import type { T_ReplacementsCollection } from "../../commonTypes"
import {
  readFile,
  writeFile,
} from "../../utils/io"

import setupTerminalListUI from "../../terminalUI/setupTerminalListUI"

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

    const fileContent = await readFile(filePath)

    const replaceWithCbFn = ({
      originalStr,
      replacementIndex: localReplacementIndex,
    }) => {
      if (localReplacementIndex === replacementIndex) {
        return `{black-fg}{white-bg}${searchReplacement}{/white-bg}{/black-fg}`
      }

      return originalStr
    }

    const newFileContent = replaceWithCb({
      searchPattern,
      shouldBeCaseSensitive,
      fileContent,
      cb: replaceWithCbFn,
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

    const fileContent = await readFile(filePath)

    const replaceWithCbFn = ({
      originalStr,
      replacementIndex: localReplacementIndex,
    }) => {
      if (localReplacementIndex === replacementIndex) {
        return searchReplacement
      }

      return originalStr
    }

    const newFileContent = replaceWithCb({
      shouldBeCaseSensitive,
      searchPattern,
      fileContent,
      cb: replaceWithCbFn,
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
    if (replacementsEntries.length === 0) {
      resolve({
        wasEmpty: true,
      })

      return
    }

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
