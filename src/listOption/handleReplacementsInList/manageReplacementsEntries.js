// @flow

import type { T_ReplacementsCollection } from "../../commonTypes"
import { replaceFileIfNecessary } from "../../replacementHelpers"
import {
  removeItemsFromArrayWhere,
  addItemsInArrayAtIndexPos,
} from "../../utils/arrays"

import type { T_ReplacementEntry } from "./handleReplacementsInList.types"

const convertReplacementIntoReplacementsEntries = (replacement, idStart) => {
  const arr = []

  for (let i = 0; i < replacement.replacementsCount; i++) {
    arr.push(Object.assign(({}: any), replacement, {
      id: idStart + i,
      replacementIndex: i,
    }))
  }

  return arr
}

type T_createReplacementsEntriesFromReplacementsCollection = (T_ReplacementsCollection) => T_ReplacementEntry[]

// it is expected that the replacementsEntries array is sorted by filePath
export const createReplacementsEntriesFromReplacementsCollection: T_createReplacementsEntriesFromReplacementsCollection =
  (replacementsCollection) => {
    const entries = replacementsCollection.reduce((acc, replacement) => {
      const newReplacementEntries = convertReplacementIntoReplacementsEntries(replacement, acc.length)

      newReplacementEntries.forEach((entry) => {
        acc.push(entry)
      })

      return acc
    }, [])

    return ((entries: any): T_ReplacementEntry[])
  }

type T_updateReplacementsEntriesForFilePath = ({|
  filePath: string,
  replacementsEntries: T_ReplacementEntry[],
  searchPattern: string,
  searchReplacement: string,
  shouldBeCaseSensitive: boolean,
|}) => Promise<void>

export const updateReplacementsEntriesForFilePath: T_updateReplacementsEntriesForFilePath = async ({
  filePath,
  replacementsEntries,
  searchPattern,
  searchReplacement,
  shouldBeCaseSensitive,
}) => {
  const minIndexOfFile = replacementsEntries.map(e => e.filePath).indexOf(filePath)
  const doesEntryHaveFilePath = entry => entry.filePath === filePath

  removeItemsFromArrayWhere(replacementsEntries, doesEntryHaveFilePath)

  const replacement = await replaceFileIfNecessary({
    filePath,
    getShouldReplaceFile: () => false,
    searchPattern,
    searchReplacement,
    shouldBeCaseSensitive,
  })

  const maxId = replacementsEntries.reduce((acc, entry) => (acc > entry.id ? acc : entry.id), 0)

  const newReplacementEntries = convertReplacementIntoReplacementsEntries(replacement, maxId + 1)

  addItemsInArrayAtIndexPos(newReplacementEntries, replacementsEntries, minIndexOfFile)
}
