#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "parse_opts.h"
#include "match_item.h"
#include "matches_ui.h"

#define VERSION "0.1.0"

void printVersion(void)
{
    printf("sr v%s\n", VERSION);
}

int main(int argc, char *argv[])
{
    ParsedOpts * parsed_opts = parseOpts(argc, argv);

    if (parsed_opts->exit_code != EXIT_SUCCESS)
    {
        return parsed_opts->exit_code;
    }

    if (parsed_opts->should_print_version_and_exit)
    {
        printVersion();

        return parsed_opts->exit_code;
    }

    FileItem * normal_file_item = FileItem_getFilesList(parsed_opts->searchPath);
    MatchItem * matched_file = getRegexMatchesFromFiles(normal_file_item, parsed_opts->searchPattern);

    FileItem_deleteList(normal_file_item);

    MatchesUI_listMatches(parsed_opts, matched_file);

    free(parsed_opts->searchPath);
    free(parsed_opts->searchPattern);
    free(parsed_opts->searchReplacement);
    free(parsed_opts);

    return parsed_opts->exit_code;
}
