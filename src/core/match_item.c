#include "match_item.h"

#include <dirent.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "../utils/search.h"

MatchItem * MatchItem_getLast(MatchItem * initial_node)
{
    MatchItem * node = initial_node;

    while (true)
    {
        if (node->next == NULL)
        {
            return node;
        }

        node = node->next;
    }

    return node;
}


int MatchItem_countList(MatchItem * item)
{
    int count = 0;
    MatchItem * node = item;

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        count++;

        node = node->next;
    }

    return count;
}

MatchItem * MatchItem_getItemN(MatchItem * item, int n)
{
    int count = 0;
    MatchItem * node = item;

    while (true)
    {
        if (node == NULL)
        {
            return NULL;
        }

        if (count == n)
        {
            return node;
        }

        count++;
        node = node->next;
    }
}

void MatchItem_copyDataToFrom(MatchItem * dest, MatchItem * src)
{
    dest->path = src->path;
    dest->index = src->index;
    dest->total = src->total;
    dest->next = src->next;
}

MatchItem * MatchItem_getNItems(MatchItem * item, int n)
{
    int count = 0;
    MatchItem * node = item;
    MatchItem * returned_item = NULL;

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        if (count == n)
        {
            break;
        }

        MatchItem * r = malloc(sizeof(MatchItem));

        MatchItem_copyDataToFrom(r, node);

        r->next = NULL;

        if (returned_item == NULL)
        {
            returned_item = r;
        }
        else
        {
            MatchItem * l = MatchItem_getLast(returned_item);

            l->next = r;
        }

        count++;
        node = node->next;
    }

    return returned_item;
}

MatchItem * MatchItem_copySingle(MatchItem * item)
{
    MatchItem * new = malloc(sizeof(MatchItem));

    MatchItem_copyDataToFrom(new, item);

    new->next = NULL;

    return new;
}

MatchItem * MatchItem_moveFirstToEnd(MatchItem * item)
{
    if (item == NULL)
    {
        return NULL;
    }

    if (item->next == NULL)
    {
        return item;
    }

    MatchItem * last = MatchItem_getLast(item);
    MatchItem * next = item->next;

    last->next = item;
    item->next = NULL;

    return next;
}

void MatchItem_deleteList(MatchItem * item)
{
    MatchItem * node = item;

    while (true)
    {
        if (node == NULL)
        {
            return;
        }

        MatchItem * old_node = node;

        node = node->next;

        free(old_node->path);
        free(old_node);
    }
}

MatchItem * getRegexMatchesFromFiles(FileItem * file_item, char * regex_str, bool should_be_case_insensitive)
{
    FileItem * node = file_item;
    MatchItem * matching_file = NULL;

    regex_t * compiled_regex = getCompiledRegex(
            regex_str,
            should_be_case_insensitive
        );

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
                r->path = malloc(sizeof(char) * strlen(node->path) + 1);

                strcpy(r->path, node->path);
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

    regfree(compiled_regex);
    free(compiled_regex);

    // due to the ordering, the first one should be move to the end
    matching_file = MatchItem_moveFirstToEnd(matching_file);

    return matching_file;
}
