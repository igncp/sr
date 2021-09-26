#include "opts_handlers.h"

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "../utils/file_io.h"
#include "../core/version.h"

#include "parse_opts.h"

void OptsHandlers_printVersion(void)
{
    printf("sr v%s\n", VERSION);
}

#define FILE_SEARCH_PATH_PREFIX "Content of file: "
#define NAMED_PIPE_SEARCH_STR "Result of process substitution"
void OptsHandlers_updateSearchPathNameForFilesList(ParsedOpts * parsed_opts)
{
    char * new_search_path = NULL;
    if (strcmp(parsed_opts->searchPath, PROCESS_SUBSTITUTION_PIPE) == 0)
    {
        new_search_path = strdup(NAMED_PIPE_SEARCH_STR);
    }
    else
    {
        int new_search_path_len = strlen(parsed_opts->searchPath) + strlen(FILE_SEARCH_PATH_PREFIX) + 1;
        new_search_path = malloc(sizeof(char) * new_search_path_len + 1);

        snprintf(
            new_search_path,
            new_search_path_len,
            "%s%s",
            FILE_SEARCH_PATH_PREFIX,
            parsed_opts->searchPath
        );
        new_search_path[new_search_path_len] = 0;
    }

    free(parsed_opts->searchPath);

    parsed_opts->searchPath = new_search_path;
}

FileItem * OptsHandlers_getFilesLists(ParsedOpts * parsed_opts)
{
    FileItem * normal_file_item = NULL;

    if (parsed_opts->should_read_files_from_file)
    {
        normal_file_item = FileItem_getFilesListFromFile(parsed_opts->searchPath);

        OptsHandlers_updateSearchPathNameForFilesList(parsed_opts);
    }
    else
    {
        normal_file_item = FileItem_getFilesListFromPath(parsed_opts->searchPath);
    }

    return normal_file_item;
}
