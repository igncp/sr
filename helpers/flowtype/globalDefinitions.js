// @flow

declare type ExactSpreadWorkaround<T> = T & $Shape<T> // eslint-disable-line no-undef

declare module "commander" {
  declare export default any
}

declare module "walk" {
  declare export default any
}

declare module "chalk" {
  declare export default any
}

declare module "inquirer" {
  declare export default any
}

declare module "blessed" {
  declare export default any
}

declare module "get-stdin" {
  declare export default any
}
