#include <stdbool.h>
#include <string.h>
#include <stdlib.h>

#include "scrollable_list.h"

#define KEY_ENTER_FIXED 10

int ScrollableList_getScreenMaxDisplayedLines(void)
{
    return LINES - 3;
}

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

int ScrollableListItem_getCount(ScrollableListItem * items) {
    int count = 0;
    ScrollableListItem * node = items;

    while(true) {
        if (node == NULL) {
            break;
        }

        node = node->next;
        count++;
    }

    return count;
}

void ScrollableListItem_copyDataToFrom(ScrollableListItem * dest, ScrollableListItem * src)
{
    dest->text = src->text;
    dest->next = src->next;
}

ScrollableListItem * ScrollableListItem_getItemN(ScrollableListItem * items, int n) {
    int count = 0;
    ScrollableListItem * node = items;

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

void ScrollableListItem_destroyItems(ScrollableListItem * items) {
    ScrollableListItem * node = items;

    while (true) {
        if (node == NULL) {
            break;
        }

        ScrollableListItem * r = node->next;

        free(node);

        node = r;
    }
}

ScrollableListItem * ScrollableListItem_getNItems(ScrollableListItem* items, int n) {
    int count = 0;
    ScrollableListItem * node = items;
    ScrollableListItem * returned_item = NULL;

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

        ScrollableListItem * r = malloc(sizeof(ScrollableListItem));

        ScrollableListItem_copyDataToFrom(r, node);

        r->next = NULL;

        if (returned_item == NULL)
        {
            returned_item = r;
        }
        else
        {
            ScrollableListItem * l = ScrollableListItem_getLast(returned_item);

            l->next = r;
        }

        count++;
        node = node->next;
    }

    return returned_item;
}

void ScrollableList_refreshList(ScrollableList * scrollable_list) {
    ScrollableListItem_destroyItems(scrollable_list->displayed_items);

    int all_items_count = ScrollableListItem_getCount(scrollable_list->all_items);
    int max_first_displayed_item_index = all_items_count - ScrollableList_getScreenMaxDisplayedLines();

    if (max_first_displayed_item_index < 0) max_first_displayed_item_index = 0;

    if (scrollable_list->first_displayed_item_index > max_first_displayed_item_index) {
        scrollable_list->first_displayed_item_index = max_first_displayed_item_index;
    }

    ScrollableListItem * first_displayed_item = ScrollableListItem_getItemN(
        scrollable_list->all_items,
        scrollable_list->first_displayed_item_index
    );

    scrollable_list->displayed_items =
        ScrollableListItem_getNItems(
            first_displayed_item,
            ScrollableList_getScreenMaxDisplayedLines()
        );

    int displayed_items_count = ScrollableListItem_getCount(scrollable_list->displayed_items);

    if (scrollable_list->selected_line_index >= displayed_items_count) {
        scrollable_list->selected_line_index = displayed_items_count - 1;
    }
}

void ScrollableList_paintRowText(int line_index, const char * text, WINDOW * window) {
    char item[1024];

    sprintf(
        item,
        "%s",
        text
    );

    int text_len = COLS - 4 - strlen(text);
    for (int i = 0; i < text_len; i++) {
        strcat(item, " ");
    }

    mvwprintw(window, line_index+1, 2, "%s", item);
}

ScrollableList ScrollableList_create(ScrollableListItem * all_items, WINDOW * window) {
    ScrollableList scrollable_list;

    scrollable_list.all_items = all_items;
    scrollable_list.displayed_items = NULL;
    scrollable_list.selected_line_index = 0;
    scrollable_list.first_displayed_item_index = 0;

    ScrollableList_refreshList(&scrollable_list);

    scrollable_list.window = window;

    ScrollableListItem * node = scrollable_list.displayed_items;

    int i = 0;
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

        ScrollableList_paintRowText(i, node->text, window);

        node = node->next;
        i++;
    }

    wrefresh(window);

    keypad(window, TRUE);
    curs_set(0);

    noecho();

    return scrollable_list;
}

void ScrollableList_tryToMoveSelectedLine(ScrollableList * scrollable_list, int movement_positions) {
    int all_items_count = ScrollableListItem_getCount(scrollable_list->all_items);
    int displayed_items_count = ScrollableListItem_getCount(scrollable_list->displayed_items);

    if (all_items_count == displayed_items_count)
    {
        scrollable_list->selected_line_index += movement_positions;

        if (scrollable_list->selected_line_index > displayed_items_count - 1)
        {
            scrollable_list->selected_line_index = displayed_items_count - 1;
        }
        else if (scrollable_list->selected_line_index < 0)
        {
            scrollable_list->selected_line_index = 0;
        }
    }
    else if (all_items_count > displayed_items_count)
    {
        int current_index = scrollable_list->selected_line_index;
        int current_position = scrollable_list->first_displayed_item_index;
        int max_first_displayed = all_items_count - displayed_items_count;

        bool is_inside_list = (current_position + current_index + movement_positions <= all_items_count) &&
            (current_position + current_index + movement_positions >= 0);

        scrollable_list->selected_line_index += movement_positions;

        if (scrollable_list->selected_line_index > displayed_items_count - 1)
        {
            scrollable_list->first_displayed_item_index += movement_positions;

            if (is_inside_list) {
                scrollable_list->selected_line_index = current_index;
            } else {
                scrollable_list->selected_line_index = displayed_items_count - 1;
            }
        }
        else if (scrollable_list->selected_line_index < 0)
        {
            scrollable_list->first_displayed_item_index += movement_positions;

            if (is_inside_list) {
                scrollable_list->selected_line_index = current_index;
            } else {
                scrollable_list->selected_line_index = 0;
            }
        }

        int first_displayed_diff = scrollable_list->first_displayed_item_index - max_first_displayed;

        if (first_displayed_diff > 0)
        {
            if (scrollable_list->selected_line_index + first_displayed_diff < displayed_items_count) {
                scrollable_list->selected_line_index += first_displayed_diff;
            }
            scrollable_list->first_displayed_item_index = max_first_displayed;
        } else if (scrollable_list->first_displayed_item_index < 0) {
            if (scrollable_list->selected_line_index + scrollable_list->first_displayed_item_index >= 0) {
                scrollable_list->selected_line_index += scrollable_list->first_displayed_item_index;
            }
            scrollable_list->first_displayed_item_index = 0;
        }

        ScrollableListItem * first_item = ScrollableListItem_getItemN(
            scrollable_list->all_items,
            scrollable_list->first_displayed_item_index
        );
        scrollable_list->displayed_items = ScrollableListItem_getNItems(first_item, ScrollableList_getScreenMaxDisplayedLines());
    }
}

void ScrollableList_paintRow(ScrollableList* scrollable_list, int line_index) {
    ScrollableListItem * node = ScrollableListItem_getItemN(scrollable_list->displayed_items, line_index);

    if(line_index == scrollable_list->selected_line_index)
        wattron(scrollable_list->window, A_STANDOUT);
    else
        wattroff(scrollable_list->window, A_STANDOUT);

    ScrollableList_paintRowText(
        line_index,
        node->text,
        scrollable_list->window
    );

    wattroff(scrollable_list->window, A_STANDOUT);
}

void ScrollableList_paintScreenItems(ScrollableList * scrollable_list) {
    ScrollableListItem * node = scrollable_list->displayed_items;
    int displayed_items_count = ScrollableListItem_getCount(node);
    int i = 0;

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        ScrollableList_paintRow(scrollable_list, i);
        wrefresh(scrollable_list->window);

        node = node->next;
        i++;
    }

    int max_displayed_lines = ScrollableList_getScreenMaxDisplayedLines();
    if (displayed_items_count < max_displayed_lines) {
        for(i = displayed_items_count; i < max_displayed_lines; i++) {
            ScrollableList_paintRowText(
                i,
                " ",
                scrollable_list->window
            );
        }
    }
}

void ScrollableList_handleEnter(ScrollableList * scrollable_list) {
    int absolute_index = scrollable_list->first_displayed_item_index + scrollable_list->selected_line_index;

    scrollable_list->onEnter(scrollable_list, absolute_index);

    ScrollableList_refreshList(scrollable_list);
}

void ScrollableList_waitForKey(ScrollableList * scrollable_list) {
    int ch;
    while((ch = wgetch(scrollable_list->window)) != 'q')
    {
        if (ch == KEY_UP)
        {
            ScrollableList_tryToMoveSelectedLine(scrollable_list, -1);
        }
        else if (ch == KEY_DOWN)
        {
            ScrollableList_tryToMoveSelectedLine(scrollable_list, 1);
        }
        else if (ch == KEY_PPAGE)
        {
            ScrollableList_tryToMoveSelectedLine(
                scrollable_list,
                ScrollableList_getScreenMaxDisplayedLines() * -1
            );
        }
        else if (ch == KEY_NPAGE)
        {
            ScrollableList_tryToMoveSelectedLine(
                scrollable_list,
                ScrollableList_getScreenMaxDisplayedLines()
            );
        }
        else if (ch == KEY_ENTER_FIXED)
        {
            ScrollableList_handleEnter(scrollable_list);
        }

        ScrollableList_paintScreenItems(scrollable_list);

        if(scrollable_list->displayed_items == NULL) {
            break;
        }
    }
}
