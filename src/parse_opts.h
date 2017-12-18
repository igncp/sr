#ifndef PARSE_OPTS_H
#define PARSE_OPTS_H

#include <stdbool.h>

typedef struct ParsedOpts
{
    char * searchPath;
    char * searchPattern;
    char * searchReplacement;
    bool should_print_version_and_exit;
    bool should_add_delimiters;
    int exit_code;
} ParsedOpts;

ParsedOpts * parseOpts(int argc, char *argv[]);

#endif
