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
