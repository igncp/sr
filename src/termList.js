import blessed from "blessed"
import fs from "fs"

import { replaceWithCb } from "./replaceFileIfNecessary"

const createPreviewBox = () => {
  const box = blessed.box({
    top: 0,
    left: "50%",
    width: "50%",
    height: "100%",
    shadow: true,
    content: "Hello {bold}world{/bold}!",
    alwaysScroll: true,
    scrollbar: {
      ch: " ",
      inverse: true,
    },
    scrollable: true,
    tags: true,
    border: {
      type: "line",
    },
    style: {
      fg: "white",
      bg: "black",
      border: {
        fg: "#f0f0f0",
      },
      focus: {
        bg: "#1a1a1a",
      },
    },
  })

  return box
}

const createListBox = ({
  items,
  screen,
}) => {
  const boxBorderOpt = {
    type: "line",
  }

  const box = blessed.box({
    border: boxBorderOpt,
    content: "Hello {bold}world{/bold}!",
    height: "100%",
    left: 0,
    parent: screen,
    style: {
      fg: "white",
      bg: "black",
      border: {
        fg: "#f0f0f0",
      },
      focus: {
        bg: "#1a1a1a",
      },
    },
    tags: true,
    top: 0,
    width: "50%",
  })

  const list = blessed.list({
    items,
    keys: false,
    mouse: true,
    parent: box,
    height: "100%",
    style: {
      selected: {
        fg: "blue",
        bg: "#1a1a1a",
      },
      item: {
        fg: "white",
        bg: "black",
      },
      fg: "white",
      focus: {
        bg: "#1a1a1a",
        item: {
          bg: "#1a1a1a",
        },
      },
      bg: "black",
      border: {
        fg: "#f0f0f0",
      },
    },
  })

  box.append(list)

  return {
    box,
    list,
  }
}

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

const setupScreen = async ({
  getPreviewContentOnMove,
  onRowSelected,
  onSuccess,
  getRows,
}) => {
  const rowsValues = getRows().map(r => r.value)
  const screen = blessed.screen({
    smartCSR: true,
  })

  const previewBox = createPreviewBox()
  const {
    box: listBox,
    list,
  } = createListBox({
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

    const removeItem = () => {
      list.removeItem(itemIndex)

      const rows = getRows()

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
    getRowsLength: () => getRows().length,
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
  previewBox.key(["up"], () => {
    previewBox.scroll(-1)
    screen.render()
  })
  previewBox.key(["down"], () => {
    previewBox.scroll(1)
    screen.render()
  })
  previewBox.key(["home"], () => {
    previewBox.scrollTo(0)
    screen.render()
  })
  previewBox.key(["end"], () => {
    const maxScroll = previewBox.getScrollHeight()

    previewBox.scrollTo(maxScroll)
    screen.render()
  })

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

const displayTermList = ({
  finalOptions,
}) => {
  const items = finalOptions.replacementsCollection.reduce((acc, replacement) => {
    for (let i = 0; i < replacement.replacementsCount; i++) {
      acc.push(Object.assign({}, replacement, {
        replacementIndex: i,
        id: acc.length,
      }))
    }

    return acc
  }, [])

  // this function assumes that the items are sorted by filePath
  const resetReplacementIndex = () => {
    let lastReplacementIndex = 0
    let lastItemFilepath = ""

    items.forEach((item) => {
      if (lastItemFilepath !== item.filePath) {
        lastReplacementIndex = 0
      } else {
        lastReplacementIndex += 1
      }

      lastItemFilepath = item.filePath

      item.replacementIndex = lastReplacementIndex
    })
  }

  const getPreviewContentOnMove = async ({
    itemIndex,
  }) => {
    const {
      filePath,
      replacementIndex,
    } = items[itemIndex]

    let localReplacementIndex = -1

    const fileContent = fs.readFileSync(filePath, "utf-8")
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
    } = items[itemIndex]

    let localReplacementIndex = -1

    const fileContent = fs.readFileSync(filePath, "utf-8")
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

    fs.writeFileSync(filePath, newFileContent)

    items.splice(itemIndex, 1)

    await removeItem()

    resetReplacementIndex()
  }

  return new Promise((resolve, reject) => {
    setupScreen({
      getPreviewContentOnMove,
      onRowSelected,
      onError: reject,
      onSuccess: resolve,
      getRows: () => items.map(i => ({
        id: i.id,
        value: `${i.filePath} ${i.replacementIndex + 1} / ${i.replacementsCount}`,
      })),
    })
  })
}

export default displayTermList
