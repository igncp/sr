// @flow

import type { T_ReplacementsCollection } from "../../commonTypes"

import type { T_ReplacementEntry } from "./handleReplacementsInList.types"

type T_resetReplacementIndex = ({
  replacementsEntries: T_ReplacementEntry[],
}) => void

// this function assumes that the replacementsEntries are sorted by filePath
export const resetReplacementIndex: T_resetReplacementIndex = ({
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

type T_createReplacementEntriesFromReplacementsCollection = (T_ReplacementsCollection) => T_ReplacementEntry[]

export const createReplacementEntriesFromReplacementsCollection: T_createReplacementEntriesFromReplacementsCollection =
  (replacementsCollection) => {
    const entries = replacementsCollection.reduce((acc, replacement) => {
      for (let i = 0; i < replacement.replacementsCount; i++) {
        acc.push(Object.assign({}, replacement, {
          id: acc.length,
          replacementIndex: i,
        }))
      }

      return acc
    }, [])

    return ((entries: any): T_ReplacementEntry[])
  }
