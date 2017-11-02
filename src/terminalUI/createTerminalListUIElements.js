// @flow

import blessed from "blessed"

import { colors } from "./terminalUIConstants"

type T_createPreviewBox = ({
  screen: any,
}) => any

type T_createListWithBox = ({
  items: any,
  screen: any,
}) => any

type T_createScreen = () => any

type T_createHeaderBox = ({|
  screen: any,
|}) => {|
  headerBox: any,
|}

const getPreviewBoxPageScrollRows = (previewBox) => {
  const scrollRows = Math.floor((previewBox.height - 2) / 2)

  return scrollRows
}

export const createPreviewBox: T_createPreviewBox = ({
  screen,
}) => {
  const previewBox = blessed.box({
    top: "10%",
    left: "50%",
    width: "50%",
    height: "90%",
    shadow: true,
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
      fg: colors.white,
      bg: colors.black,
      border: {
        fg: colors.white,
      },
      focus: {
        bg: colors.grey,
      },
    },
  })

  previewBox.key(["up"], () => {
    previewBox.scroll(-1)
    screen.render()
  })

  previewBox.key(["pageup"], () => {
    const scrollRows = getPreviewBoxPageScrollRows(previewBox)

    previewBox.scroll(-1 * scrollRows)

    screen.render()
  })

  previewBox.key(["down"], () => {
    previewBox.scroll(1)
    screen.render()
  })

  previewBox.key(["pagedown"], () => {
    const scrollRows = getPreviewBoxPageScrollRows(previewBox)

    previewBox.scroll(scrollRows)

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

  return previewBox
}

export const createListWithBox: T_createListWithBox = ({
  items,
  screen,
}) => {
  const listBox = blessed.box({
    border: {
      type: "line",
    },
    height: "90%",
    left: 0,
    parent: screen,
    style: {
      fg: colors.white,
      bg: colors.black,
      border: {
        fg: colors.white,
      },
      focus: {
        bg: colors.grey,
      },
    },
    tags: true,
    top: "10%",
    width: "50%",
  })

  const list = blessed.list({
    items,
    keys: false,
    mouse: true,
    parent: listBox,
    height: "97%",
    style: {
      selected: {
        fg: colors.blue,
        bg: colors.grey,
      },
      item: {
        fg: colors.white,
        bg: colors.black,
      },
      fg: colors.white,
      focus: {
        bg: colors.grey,
        item: {
          bg: colors.grey,
        },
      },
      bg: colors.black,
      border: {
        fg: colors.white,
      },
    },
  })

  listBox.append(list)

  return {
    listBox,
    list,
  }
}

export const createScreen: T_createScreen = () => {
  const screen = blessed.screen({
    smartCSR: true,
  })

  return screen
}

export const createHeaderBox: T_createHeaderBox = ({
  screen,
}) => {
  const headerBox = blessed.box({
    border: {
      type: "line",
    },
    height: "9%",
    left: 0,
    parent: screen,
    style: {
      fg: colors.white,
      bg: colors.black,
      border: {
        fg: colors.white,
      },
      focus: {
        bg: colors.grey,
      },
    },
    tags: true,
    top: 0,
    width: "100%",
    content: "",
    align: "center",
    valign: "middle",
  })

  return {
    headerBox,
  }
}

// istanbul ignore else
if (global.__TEST__) {
  module.exports._test = {
    getPreviewBoxPageScrollRows,
  }
}
