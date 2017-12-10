# SR

Search and replace for the command line

**This project is under active development**

The initial project was written in JS, but the performance was not great when searching in many files

As a JS developer, the implementation was easier in JS, but C gives a better UX due to the greater speed

With the C implementation (not finished) the results appear in less than 1 second even for medium size projects (~50k lines)

[You can find the JS project in another branch](https://github.com/igncp/sr/tree/js)

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

## License

Ignacio Carbajo - MIT
