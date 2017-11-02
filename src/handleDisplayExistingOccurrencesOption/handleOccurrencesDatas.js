// @flow

import setupTerminalListUI from "../terminalUI/setupTerminalListUI"

import type { T_OccurrencesData } from "./findHelpers"
import { readFile } from "../utils/io"
import { replaceWithCb } from "../replacementHelpers"
import { getDisplayedRelativePath } from "../utils/path"

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

    if (!entry) {
      return {
        content: "",
        focusPosition: 0,
      }
    }

    const fileContent = await readFile(entry.filePath)

    let focusPosition = 0

    const replaceWithCbFn = ({
      offset,
      originalStr,
      replacementIndex,
    }) => {
      if (replacementIndex === entry.occurrenceIndex) {
        focusPosition = offset

        return `{black-fg}{white-bg}${originalStr}{/white-bg}{/black-fg}`
      }

      return originalStr
    }

    const newContent = replaceWithCb({
      fileContent,
      searchPattern: findString,
      shouldBeCaseSensitive: true,
      cb: replaceWithCbFn,
    })

    return {
      content: newContent,
      focusPosition,
    }
  }

  const onRowSelected = async ({
    itemIndex,
  }) => {
    occurrencesEntries.splice(itemIndex, 1)
  }

  const getHeaderContent = ({
    itemIndex,
  }) => {
    const entry = occurrencesEntries[itemIndex]

    return entry ? `Existing Strings List: ${findString}\n` +
      `${getDisplayedRelativePath(occurrencesEntries[itemIndex].filePath)}` : ""
  }

  return new Promise((resolve) => {
    if (occurrencesEntries.length === 0) {
      resolve()

      return
    }

    setupTerminalListUI({
      getPreviewContentOnMove,
      getHeaderContent,
      onRowSelected,
      onSuccess: resolve,
      getListRows: () => {
        return occurrencesEntries.map(entry => ({
          id: entry.id,
          value: `${entry.occurrenceIndex + 1} / ${entry.occurrencesCount} ${getDisplayedRelativePath(entry.filePath)}`,
        }))
      },
    })
  })
}

export default handleOccurrencesDatas
