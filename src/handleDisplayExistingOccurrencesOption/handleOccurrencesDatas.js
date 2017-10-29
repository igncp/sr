// @flow

import setupTerminalListUI from "../terminalUI/setupTerminalListUI"

import type { T_OccurrencesData } from "./findHelpers"
import { readFile } from "../utils/io"
import { replaceWithCb } from "../replacementHelpers"

type T_handleOccurrencesData = ({
  findString: string,
  occurrencesDatas: T_OccurrencesData[],
}) => Promise<void>

const handleOccurrencesDatas: T_handleOccurrencesData = ({
  findString,
  occurrencesDatas,
}) => {
  const occurrencesEntries = occurrencesDatas.reduce((acc, occurrencesData) => {
    for (let i = 0; i < occurrencesData.occurrencesCount; i++) {
      const newEntry = Object.assign({}, occurrencesData, {
        occurrenceIndex: i,
        id: acc.length,
      })

      acc.push(newEntry)
    }

    return acc
  }, [])

  const getPreviewContentOnMove = async ({
    itemIndex,
  }) => {
    const entry = occurrencesEntries[itemIndex]

    const fileContent = await readFile(entry.filePath)

    let localReplacementIndex = -1

    return replaceWithCb({
      fileContent,
      searchPattern: findString,
      shouldBeCaseSensitive: true,
      cb: (original) => {
        localReplacementIndex++

        if (localReplacementIndex === entry.occurrenceIndex) {
          return `{black-fg}{white-bg}${original}{/white-bg}{/black-fg}`
        }

        return original
      },
    })
  }

  const onRowSelected = async ({
    itemIndex,
  }) => {
    occurrencesEntries.splice(itemIndex, 1)
  }

  return new Promise((resolve) => {
    setupTerminalListUI({
      getPreviewContentOnMove,
      onRowSelected,
      onSuccess: resolve,
      getListRows: () => {
        return occurrencesEntries.map(entry => ({
          id: entry.id,
          value: `${entry.filePath} ${entry.occurrenceIndex + 1} / ${entry.occurrencesCount}`,
        }))
      },
    })
  })
}

export default handleOccurrencesDatas
