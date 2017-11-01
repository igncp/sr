// @flow

type T_createListKeysHandlers = ({
  getRowsLength: () => number,
  list: *,
  onEnter: ({ itemIndex: number }) => Promise<boolean>,
  onMove: ({ itemIndex: number }) => Promise<void>,
  screen: *,
}) => {
  handleEnter: () => Promise<void>,
  handleMoveDown: () => Promise<void>,
  handleMovePageDown: () => Promise<void>,
  handleMovePageUp: () => Promise<void>,
  handleMoveUp: () => Promise<void>,
}

export const createListKeysHandlers: T_createListKeysHandlers = ({
  getRowsLength,
  list,
  onEnter,
  onMove,
  screen,
}) => {
  let isInTrasition = false

  const getMoveFn = rowsMoved => async () => {
    if (isInTrasition) {
      return
    }

    isInTrasition = true

    const idx = list.getScroll()
    const rowsLength = getRowsLength()

    let newItemIndex = idx + rowsMoved

    if (rowsLength === 0) {
      return
    }

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
  const handleMoveBecauseDeletion = getMoveFn(0)
  const handleMovePageUp = getMoveFn(list.height * -1)
  const handleMovePageDown = getMoveFn(list.height)

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
      await handleMoveBecauseDeletion()
    } else if (idx !== 0) {
      await handleMoveDown()
    } else {
      await handleMoveUp()
    }
  }

  return {
    handleEnter,
    handleMoveDown,
    handleMovePageDown,
    handleMovePageUp,
    handleMoveUp,
  }
}
