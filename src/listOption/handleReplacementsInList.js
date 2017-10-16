// @flow

import { replaceWithCb } from "../replaceFileIfNecessary"
import type { T_FinalOptions } from "../commonTypes"
import {
  readFile,
  writeFile,
} from "../helpers"

import setupTerminalListUI from "./setupTerminalListUI"

type T_handleReplacementsInList = ({
  finalOptions: T_FinalOptions,
}) => Promise<{}>

type T_ReplacementEntry = {|
  filePath: string,
  id: number,
  replacementIndex: number,
  replacementsCount: number,
|}

// this function assumes that the replacementsEntries are sorted by filePath
const resetReplacementIndex = ({
  replacementsEntries,
}) => {
  let lastReplacementIndex = 0
  let lastItemFilepath = ""

  replacementsEntries.forEach((item) => {
    if (lastItemFilepath !== item.filePath) {
      lastReplacementIndex = 0
    } else {
      lastReplacementIndex += 1
    }

    lastItemFilepath = item.filePath

    item.replacementIndex = lastReplacementIndex
  })
}

const createReplacementEntriesFromReplacementsCollection = (replacementsCollection) => {
  return replacementsCollection.reduce((acc, replacement) => {
    for (let i = 0; i < replacement.replacementsCount; i++) {
      acc.push(Object.assign({}, replacement, {
        id: acc.length,
        replacementIndex: i,
      }))
    }

    return acc
  }, [])
}

const handleReplacementsInList: T_handleReplacementsInList = ({
  finalOptions,
}) => {
  const replacementsEntries: T_ReplacementEntry[] =
    createReplacementEntriesFromReplacementsCollection(finalOptions.replacementsCollection)

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
      finalOptions,
      fileContent,
      cb: (original) => {
        localReplacementIndex++

        if (localReplacementIndex === replacementIndex) {
          return `{black-fg}{white-bg}${finalOptions.searchReplacement}{/white-bg}{/black-fg}`
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
      finalOptions,
      fileContent,
      cb: (original) => {
        localReplacementIndex++

        if (localReplacementIndex === replacementIndex) {
          return finalOptions.searchReplacement
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
