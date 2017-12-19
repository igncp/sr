SRC_FILES := $(shell find ../src/ -type f -name "*.c" ! -name "sr.c")

default:
	@mkdir -p ../build/test
	@gcc \
		-g \
		-lcurses \
		-ltinfo \
		-lcheck \
		-fprofile-arcs \
		-ftest-coverage \
		./*.c \
		${SRC_FILES} \
		-o ../build/test/test_result
