# SR

[![npm version](https://badge.fury.io/js/sr-igncp.svg)](https://badge.fury.io/js/sr-igncp) [![Build Status](https://travis-ci.org/igncp/sr.svg?branch=master)](https://travis-ci.org/igncp/sr) [![Coverage Status](https://coveralls.io/repos/github/igncp/sr/badge.svg?branch=master)](https://coveralls.io/github/igncp/sr?branch=master)

Search and replace for the command line

**This package is under active development. The package name is provisional and the API may have breaking changes**

It provides a productive way of replacing strings in files via command line, including the following features:
- Replace matches one by one, viewing the diff, and updating the diff each time a change is made to a file
- Use regular expressions, which accept matched groups in the replacements, using `String.prototype.replace` under the hood
- Preview already existing matches of the replacement text in case you want to make sure it is a new string

For more info, you can run:

`sr --help`

It requires Node v6.10 or higher

This package uses Node for everything, and it will be slower than other alternatives using C, Go, Rust, etc. The goal of this package is not maximize performance, but the features listed above. The speed in medium project sizes (less than 100k lines) is acceptable. PRs to improve the performance are always welcome.

The controls when using the list UI are:

- Exit: `q` or `control-c`
- Scroll preview: `right` and `Page-Up` or `Page-down`
- Replace: `Enter`

## Examples

A simple replacement command with a list UI:

`sr searchPath 'a regex*? search pattern' 'a search replacement'`

You can't use `sr` with pipes because the terminal UI would not work. However, you can use command substitution:

`sr <(find docs -type f -name "*.md") searchPattern searchReplacement`

If you don't want any UI and just want the matches replaced:

`sr --disable-list path searchPattern searchReplacement`

## License

MIT
