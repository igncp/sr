#ifndef PARSE_OPTS_H
#define PARSE_OPTS_H

#include <string>

namespace cli_opts
{

typedef struct ParsedOpts
{
    ParsedOpts();
    ~ParsedOpts();

    std::string * searchPath;
    std::string * searchPattern;
    std::string * searchReplacement;

    bool should_print_version_and_exit;
    bool should_add_delimiters;
    bool should_read_files_from_file;
    bool should_be_case_insensitive;

    int exit_code;
} ParsedOpts;

ParsedOpts * parseOpts(int argc, char *argv[]);

} // namespace cli_opts

#endif
