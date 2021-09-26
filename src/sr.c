#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <locale.h>

#include "utils/file_item.h"
#include "cli/parse_opts.h"
#include "cli/opts_handlers.h"
#include "core/match_item.h"
#include "ui/matches_ui.h"

int free_opts_and_return(ParsedOpts * parsed_opts)
{
    int exit_code = parsed_opts->exit_code;

    free(parsed_opts);

    return exit_code;
}

int main(int argc, char *argv[])
{
    ParsedOpts * parsed_opts = parseOpts(argc, argv);

    if (parsed_opts->exit_code != EXIT_SUCCESS)
    {
        return free_opts_and_return(parsed_opts);
    }

    if (parsed_opts->should_print_version_and_exit)
    {
        OptsHandlers_printVersion();

        return free_opts_and_return(parsed_opts);
    }

    setlocale(LC_ALL, "en_US.UTF-8");

    FileItem * normal_file_item = OptsHandlers_getFilesLists(parsed_opts);

    MatchItem * matched_file = getRegexMatchesFromFiles(
            normal_file_item,
            parsed_opts->searchPattern,
            parsed_opts->should_be_case_insensitive
        );

    FileItem_deleteList(normal_file_item);

    MatchesUI_listMatches(parsed_opts, matched_file);

    free(parsed_opts->searchPath);
    free(parsed_opts->searchPattern);
    free(parsed_opts->searchReplacement);

    return free_opts_and_return(parsed_opts);
}
