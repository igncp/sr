// @flow

import {
  createScreen,
  createListWithBox,
  createPreviewBox,
} from "./createTerminalListUIElements"

type T_getPreviewContentOnMove = ({
  itemIndex: number,
}) => Promise<string>

type T_onRowSelected = ({
  itemIndex: number,
  removeItem: () => Promise<void>,
}) => Promise<void>

type T_onSuccess = (any) => void

type T_ListRow = {
  id: number,
  value: string,
}

type T_getListRows = () => Array<T_ListRow>

type T_setupTerminalListUI = ({|
  getPreviewContentOnMove: T_getPreviewContentOnMove,
  onRowSelected: T_onRowSelected,
  onSuccess: T_onSuccess,
  getListRows: T_getListRows,
|}) => Promise<void>

const createListKeysHandlers = ({
  getRowsLength,
  list,
  onEnter,
  onMove,
  screen,
}) => {
  let isInTrasition = false

  const getMoveFn = factor => async () => {
    if (isInTrasition) {
      return
    }

    isInTrasition = true

    const idx = list.getScroll()
    const rowsLength = getRowsLength()

    let newItemIndex = idx + 1 * factor

    if (newItemIndex < 0) {
      newItemIndex = 0
    } else if (newItemIndex >= rowsLength) {
      newItemIndex = rowsLength - 1
    }

    await onMove({
      itemIndex: newItemIndex,
    })

    list.select(newItemIndex)

    screen.render()

    isInTrasition = false
  }

  const handleMoveDown = getMoveFn(1)
  const handleMoveUp = getMoveFn(-1)

  const handleEnter = async () => {
    if (isInTrasition) {
      return
    }

    isInTrasition = true

    const idx = list.getScroll()

    const shouldMove = await onEnter({
      itemIndex: idx,
    })

    isInTrasition = false

    if (!shouldMove) {
      return
    }

    if (idx !== 0) {
      await handleMoveDown()
    } else {
      await handleMoveUp()
    }
  }

  return {
    handleEnter,
    handleMoveDown,
    handleMoveUp,
  }
}

const setupTerminalListUI: T_setupTerminalListUI = async ({
  getPreviewContentOnMove,
  onRowSelected,
  onSuccess,
  getListRows,
}) => {
  const rowsValues = getListRows().map(r => r.value)
  const screen = createScreen()

  const previewBox = createPreviewBox({
    screen,
  })

  const {
    listBox,
    list,
  } = createListWithBox({
    screen,
    items: rowsValues.slice(0),
  })

  screen.append(listBox)
  screen.append(previewBox)

  const onMove = async ({
    itemIndex,
  }) => {
    const previewContent = await getPreviewContentOnMove({
      itemIndex,
    })

    previewBox.setContent(previewContent)
  }

  const onEnter = async ({
    itemIndex,
  }) => {
    let shouldMove = false

    const removeItem = async () => {
      list.removeItem(itemIndex)

      const rows = getListRows()

      if (rows.length === 0) {
        screen.destroy()

        return
      }

      shouldMove = true
    }

    await onRowSelected({
      itemIndex,
      removeItem,
    })

    return shouldMove
  }

  const {
    handleMoveDown,
    handleEnter,
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
  list.key(["right"], () => previewBox.focus())

  previewBox.key(["left"], () => list.focus())

  const getFinishScreenFn = cb => () => {
    screen.destroy()
    cb()
  }

  screen.key(["C-c", "q"], getFinishScreenFn(() => {
    onSuccess({})
  }))

  await onMove({
    itemIndex: 0,
  })

  listBox.focus()
  list.focus()

  screen.render()
}

export default setupTerminalListUI
