# SR

Search and replace for the command line

**This project is under active development**

## Install

As it is still in an early stage, there is not much functionality available

If you want to try it, you will need to install ncurses. Currently it is only tested under Arch Linux.

To run the binary:

```
make
./build/bin/sr
```

To run the tests:
```
cd tests
make && ../build/test/test_result`
```

## Background

The initial project was written in JS, but the performance was not great when searching in many files

As a JS developer, the implementation was easier in JS, but C gives a better UX due to the greater speed

With the C implementation the results appear in less than 1 second even for huge volumes (e.g. ~500k lines), compared to JS where it would take more than 25 seconds

In JS everything was already handled asynchronous (files reading, searching), except the display of the results screen, where you can select which matches to change

A possible solution for JS was to load the results in the screen incrementally

However, opted by creating a C proof of concept first and the UX so far is very good

[You can find the JS project in another branch](https://github.com/igncp/sr/tree/js)

## License

Ignacio Carbajo - MIT
