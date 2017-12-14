#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include "common_types.h"
#include "file_item.h"
#include "match_item.h"
#include "search.h"
#include "matches_ui.h"

void printHelp(void)
{
    printf("Usage: sr <path> <search> <replacement>");
}

ParsedOpts * extractArguments(int argc, char *argv[])
{
    if (argc < 4)
    {
        printHelp();

        exit(EXIT_FAILURE);
    }

    ParsedOpts * opts = malloc(sizeof(ParsedOpts));

    opts->searchPath = argv[1];
    opts->searchPattern = argv[2];
    opts->searchReplacement = argv[3];

    return opts;
}

MatchItem * getRegexMatchesFromFiles(FileItem * file_item, char * regex_str)
{
    FileItem * node = file_item;
    MatchItem * matching_file = NULL;

    regex_t * compiled_regex = getCompiledRegex(regex_str);

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        int numberOfMatches = getFileContentRegexMatchesNumber(node->path, compiled_regex);

        if (numberOfMatches > 0)
        {
            for (int i = numberOfMatches - 1; i >= 0; i--)
            {
                MatchItem * r = malloc(sizeof(MatchItem));

                r->path = node->path;
                r->total = numberOfMatches;
                r->index = i;

                if (matching_file == NULL)
                {
                    matching_file = r;

                    matching_file->next = NULL;
                }
                else
                {
                    r->next = matching_file->next;

                    matching_file->next = r;
                }
            }
        }

        node = node->next;
    }

    // due to the ordering, the first one should be move to the end
    matching_file = MatchItem_moveFirstToEnd(matching_file);

    return matching_file;
}

int main(int argc, char *argv[])
{
    ParsedOpts * parsed_opts = extractArguments(argc, argv);

    FileItem * normal_file_item = FileItem_getFilesList(parsed_opts->searchPath);
    MatchItem * matched_file = getRegexMatchesFromFiles(normal_file_item, parsed_opts->searchPattern);

    FileItem_deleteList(normal_file_item);

    MatchesUI_listMatches(parsed_opts, matched_file);

    return(EXIT_SUCCESS);
}
