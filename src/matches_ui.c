#include "matches_ui.h"

#include <curses.h>
#include <stdlib.h>

#include "match_item.h"
#include "scrollable_list.h"

static MatchItem * g_all_matched_items;

ScrollableListItem * MatchesUI_getAllListItems(void) {
    MatchItem * node = g_all_matched_items;
    ScrollableListItem * scrollable_list_items = NULL;

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        ScrollableListItem * r = malloc(sizeof(ScrollableListItem));

        r->text = malloc(sizeof(char[1000]));
        sprintf(r->text, "%ld / %ld - %s", node->index + 1, node->total, node->path);
        r->next = NULL;

        if (scrollable_list_items == NULL) {
            scrollable_list_items = r;
        } else {
            ScrollableListItem_getLast(scrollable_list_items)->next = r;
        }

        node = node->next;
    }

    return scrollable_list_items;
}

void MatchesUI_handleEnter(ScrollableList * scrollable_list, int absolute_index) {
    MatchItem * item = MatchItem_getItemN(g_all_matched_items, absolute_index);
    int all_matched_items_count = MatchItem_countList(g_all_matched_items);

    if (absolute_index == 0) {
        g_all_matched_items = item->next;

        free(item);
    } else {
        MatchItem * r = MatchItem_getItemN(g_all_matched_items, absolute_index - 1);

        if (absolute_index == all_matched_items_count - 1) {
            free(item);

            r->next = NULL;
        } else {
            r->next = r->next->next;

            free(item);
        }
    }

    ScrollableListItem_destroyItems(scrollable_list->all_items);

    scrollable_list->all_items = MatchesUI_getAllListItems();
}

void MatchesUI_listMatches(MatchItem * all_matched_item)
{
    WINDOW * window;

    g_all_matched_items = all_matched_item;

    initscr();
    window = newwin(LINES - 1, COLS - 1, 1, 1);
    box(window, 0, 0);

    ScrollableListItem * scrollable_list_items = MatchesUI_getAllListItems();

    ScrollableList scrollable_list = ScrollableList_create(scrollable_list_items, window);

    scrollable_list.onEnter = &MatchesUI_handleEnter;

    ScrollableList_waitForKey(&scrollable_list);

    delwin(window);
    endwin();
}
