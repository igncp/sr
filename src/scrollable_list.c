#include <stdbool.h>
#include <stdlib.h>

#include "scrollable_list.h"

ScrollableListItem * ScrollableListItem_getLast(ScrollableListItem * items) {
    ScrollableListItem * node = items;

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        if (node->next == NULL) {
            break;
        }

        node = node->next;
    }

    return node;
}

ScrollableList ScrollableList_create(ScrollableListItem * all_items, WINDOW * window) {
    ScrollableList scrollable_list;
    ScrollableListItem * displayed_items = NULL;

    scrollable_list.all_items = all_items;
    scrollable_list.displayed_items = displayed_items;
    scrollable_list.window = window;

    int i = 0;

    ScrollableListItem * node = displayed_items;

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        if( i == 0 )
            wattron( window, A_STANDOUT );
        else
            wattroff( window, A_STANDOUT );

        mvwprintw(window, i +1, 2, "%s", node->text);

        node = node->next;
        i++;
    }

    wrefresh(window);

    keypad(window, TRUE);
    curs_set(0);

    noecho();

    return scrollable_list;
}
