# Design

The tool is organized by the following submodules:

- **core**: Main business logic without any knowledge about UI
    - Should not have other internal dependencies (except utils)
- **cli**: Related to CLI options parsing
- **ui**: Related to the UI, currently ncurses
- **utils**: General utilities that can be used by any other module
