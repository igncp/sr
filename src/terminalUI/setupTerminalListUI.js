// @flow

import { getLineNumberOfPositionInString } from "../utils/strings"
import {
  createHeaderBox,
  createListWithBox,
  createPreviewBox,
  createScreen,
} from "./createTerminalListUIElements"

import { createListKeysHandlers } from "./createListKeysHandlers"

type T_getPreviewContentOnMove = ({
  itemIndex: number,
}) => Promise<{|
  content: string,
  focusPosition?: number,
|}>

type T_onRowSelected = ({|
  itemIndex: number,
|}) => Promise<void>

type T_onSuccess = (any) => void

type T_ListRow = {
  id: number,
  value: string,
}

type T_getListRows = () => Array<T_ListRow>

type T_getHeaderContent = (({|
  itemIndex: number,
|})) => string

type T_setupTerminalListUI = ({|
  getHeaderContent: T_getHeaderContent,
  getListRows: T_getListRows,
  getPreviewContentOnMove: T_getPreviewContentOnMove,
  onRowSelected: T_onRowSelected,
  onSuccess: T_onSuccess,
|}) => Promise<void>

const setupTerminalListUI: T_setupTerminalListUI = async ({
  getHeaderContent,
  getListRows,
  getPreviewContentOnMove,
  onRowSelected,
  onSuccess,
}) => {
  const getRowsValues = () => getListRows().map(r => r.value)
  const screen = createScreen()

  const previewBox = createPreviewBox({
    screen,
  })

  const {
    listBox,
    list,
  } = createListWithBox({
    screen,
    items: getRowsValues(),
  })

  const {
    headerBox,
  } = createHeaderBox({
    screen,
  })

  screen.append(listBox)
  screen.append(previewBox)
  screen.append(headerBox)

  const onMove = async ({
    itemIndex,
  }) => {
    const {
      content,
      focusPosition,
    } = await getPreviewContentOnMove({
      itemIndex,
    })

    const lineNumber = getLineNumberOfPositionInString({
      string: content,
      position: focusPosition || 0,
    })

    const scrollPosition = Math.floor(lineNumber - (previewBox.height / 3))
    const headerContent = getHeaderContent({
      itemIndex,
    })

    previewBox.setContent(content)
    previewBox.scrollTo(scrollPosition < 0 ? 0 : scrollPosition)
    headerBox.setContent(headerContent)
  }

  const finish = () => {
    screen.destroy()
    onSuccess({})
  }

  const onEnter = async ({
    itemIndex,
  }) => {
    await onRowSelected({
      itemIndex,
    })

    const rowsValues = getRowsValues()

    if (rowsValues.length === 0) {
      finish()

      return false
    }

    list.setItems(rowsValues)

    return false
  }

  const {
    handleEnter,
    handleMoveDown,
    handleMovePageDown,
    handleMovePageUp,
    handleMoveUp,
  } = createListKeysHandlers({
    getRowsLength: () => getListRows().length,
    list,
    onEnter,
    onMove,
    screen,
  })

  list.key(["down"], handleMoveDown)
  list.key(["up"], handleMoveUp)
  list.key(["enter"], handleEnter)
  list.key(["pageup"], handleMovePageUp)
  list.key(["pagedown"], handleMovePageDown)
  list.key(["right"], () => previewBox.focus())

  previewBox.key(["left"], () => list.focus())

  screen.key(["C-c", "q"], finish)

  await onMove({
    itemIndex: 0,
  })

  listBox.focus()
  list.focus()

  screen.render()
}

export default setupTerminalListUI
