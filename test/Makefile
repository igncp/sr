SRC_FILES := $(shell find ../src/ -type f -name "*.c" ! -name "sr.c")

default:
	@mkdir -p ../build/test
	@gcc \
		-g \
		-O \
		./*.c \
		${SRC_FILES} \
		-I../include \
		-ltinfo \
		-lcheck \
		-lcurses \
		-o ../build/test/test_result
