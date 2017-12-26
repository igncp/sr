#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <locale.h>

#include "parse_opts.h"
#include "file_item.h"
#include "opts_handlers.h"
#include "match_item.h"
#include "matches_ui.h"

int main(int argc, char *argv[])
{
    ParsedOpts * parsed_opts = parseOpts(argc, argv);

    if (parsed_opts->exit_code != EXIT_SUCCESS)
    {
        return parsed_opts->exit_code;
    }

    if (parsed_opts->should_print_version_and_exit)
    {
        OptsHandlers_printVersion();

        return parsed_opts->exit_code;
    }

    setlocale(LC_ALL, "en_US.UTF-8");

    FileItem * normal_file_item = OptsHandlers_getFilesLists(parsed_opts);

    MatchItem * matched_file = getRegexMatchesFromFiles(normal_file_item, parsed_opts->searchPattern);

    FileItem_deleteList(normal_file_item);

    MatchesUI_listMatches(parsed_opts, matched_file);

    int exit_code = parsed_opts->exit_code;

    free(parsed_opts->searchPath);
    free(parsed_opts->searchPattern);
    free(parsed_opts->searchReplacement);
    free(parsed_opts);

    return exit_code;
}
