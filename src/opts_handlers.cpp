#include "opts_handlers.h"

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "parse_opts_c.h"
#include "version.h"
#include "file_item.h"

namespace cli_opts
{

void printVersion(void)
{
    printf("sr v%s\n", VERSION);
}

file_io::FileItem * OptsHandlers_getFilesLists(ParsedOpts * parsed_opts)
{
    file_io::FileItem * normal_file_item = NULL;

    if (parsed_opts->should_read_files_from_file)
    {
        // normal_file_item = file_io::getFilesListFromFile(parsed_opts->searchPath);

        // OptsHandlers_updateSearchPathNameForFilesList(parsed_opts);
    }
    else
    {
        normal_file_item = file_io::getFilesListFromPath(parsed_opts->searchPath);
    }

    return normal_file_item;
}

} // namespace cli_opts
