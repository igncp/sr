#include <dirent.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "match_item.h"

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
    if (item == NULL) {
        return NULL;
    }

    if (item->next == NULL) {
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

        free(old_node);
    }
}
