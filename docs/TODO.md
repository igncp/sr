# TODO

### Known Fixes

- Scroll item to the middle when selecting row / pageup / pagedown in main list
- Highlight centering for long files

### Functionality

- Improve preview message when displaying list
  - Add keys helpers
  - Display difference
  - Better movement keys
- Add preview to list
- Add integration tests
- Add option to convert on the fly / convert at the end (to be able to do ctrl-c)
- Add option to just see the difference

### Infrastructure

- Reduce `any` annotations in src (not in modules)
- Setup script to publish to npm bumping version
- Setup commit msg validator

### Docs

- Add tutorial in main Readme
- Add bigger docs

### Refactors

None

### Discarded

- Accept set of files from pipe (e.g. `find . -type f | sr search replacement`)
  - This is discarded due to blessed.js not working when the terminal is not a TTY. Added the `-f` function instead
