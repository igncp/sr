SRC_FILES := $(shell find src -type f -name "*.c")

default:
	@mkdir -p build/bin
	@gcc \
		-g \
		-O \
		${SRC_FILES} \
		-Iinclude \
		-Wall -Wextra -Wpedantic \
		-Wformat=2 -Wno-unused-parameter -Wshadow \
		-Wwrite-strings -Wstrict-prototypes -Wold-style-definition \
		-Wredundant-decls -Wnested-externs -Wmissing-include-dirs \
		-lcurses \
		-ltinfo \
		-o build/bin/sr && \
		echo "built correctly"

clean:
	@rm -f test/test_main
	@find . -type f -name "*.orig" | xargs -I{} rm {}
	@find . -type f -name "*.gcda" | xargs -I{} rm {}
	@find . -type f -name "*.gcno" | xargs -I{} rm {}
