#include <stdbool.h>
#include <string.h>
#include <stdlib.h>

#include "scrollable_list.h"

#define KEY_ENTER_FIXED 10

int ScrollableList_getScreenMaxDisplayedLines(ScrollableList * scrollable_list)
{
    return scrollable_list->height - 2;
}

int ScrollableList_getMaxLineWidth(ScrollableList * scrollable_list) {
    return scrollable_list->width - 3;
}

ScrollableListItem * ScrollableListItem_create(char * text) {
    ScrollableListItem * item = malloc(sizeof(ScrollableListItem));

    item->text = malloc(sizeof(char) * strlen(text) + 1);
    strcpy(item->text, text);

    item->next = NULL;

    return item;
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

        if (node->text) {
            free(node->text);
        }
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

        ScrollableListItem * r = ScrollableListItem_create(node->text);
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
    int max_first_displayed_item_index = all_items_count - ScrollableList_getScreenMaxDisplayedLines(scrollable_list);

    if (max_first_displayed_item_index < 0) max_first_displayed_item_index = 0;

    if (scrollable_list->first_displayed_item_index > max_first_displayed_item_index) {
        scrollable_list->first_displayed_item_index = max_first_displayed_item_index;
    } else if (scrollable_list->first_displayed_item_index < 0) {
        scrollable_list->first_displayed_item_index = 0;
    }

    ScrollableListItem * first_displayed_item = ScrollableListItem_getItemN(
        scrollable_list->all_items,
        scrollable_list->first_displayed_item_index
    );

    scrollable_list->displayed_items =
        ScrollableListItem_getNItems(
            first_displayed_item,
            ScrollableList_getScreenMaxDisplayedLines(scrollable_list)
        );

    int displayed_items_count = ScrollableListItem_getCount(scrollable_list->displayed_items);

    if (scrollable_list->selected_line_index >= displayed_items_count) {
        scrollable_list->selected_line_index = displayed_items_count - 1;
    }
}

void ScrollableList_painRowTextWithSelection(int line_index, char * text, int selection_start, int selection_end, WINDOW * window) {
    int painted_line = line_index + 1;
    int text_len = strlen(text);

    if (selection_start > 0) {
        char subbuff[selection_start];
        memcpy(subbuff, &text[0], selection_start);
        subbuff[selection_start] = 0;

        wattroff(window, A_STANDOUT);

        mvwprintw(window, painted_line, 1, "%s", subbuff);
    }


    if (selection_start != selection_end) {
        char subbuff[selection_end - selection_start];
        memcpy(subbuff, &text[selection_start], selection_end - selection_start);
        subbuff[selection_end - selection_start] = 0;

        wattron(window, A_STANDOUT);

        mvwprintw(window, painted_line, 1 + selection_start, "%s", subbuff);
    }

    wattroff(window, A_STANDOUT);

    if (selection_end < text_len - 1) {
        char subbuff[text_len - selection_end];
        memcpy(subbuff, &text[selection_end], text_len - selection_end);
        subbuff[text_len - selection_end] = 0;

        mvwprintw(window, painted_line, 1 + selection_end, "%s", subbuff);
    }
}

void ScrollableList_paintRowText(
    int line_index,
    const char * text,
    ScrollableList * scrollable_list
) {
    char item[1024];
    int max_line_width = ScrollableList_getMaxLineWidth(scrollable_list);
    int text_len = strlen(text);
    int spaces_len = max_line_width - text_len;
    char * leftpad = NULL;

    if (scrollable_list->should_center_text) {
        int leftpad_num = spaces_len / 2;
        leftpad = malloc(sizeof(char) * leftpad_num + 1);

        strcpy(leftpad, " ");
        for (int i = 0; i < leftpad_num - 1; i++) {
            strcat(leftpad, " ");
        }
    } else {
        leftpad = malloc(sizeof(char) + 1);
        strcpy(leftpad, " ");
    }

    snprintf(
        item,
        max_line_width,
        "%s%s",
        leftpad,
        text
    );

    free(leftpad);

    int spaces_len_right = max_line_width - strlen(item);
    for (int i = 0; i <= spaces_len_right; i++) {
        strcat(item, " ");
    }

    int selection_start = 0;
    int selection_end = 0;

    if (line_index == scrollable_list->selected_line_index) {
        if (scrollable_list->selection_mode == ScrollableList_SelectionMode_LineFragment) {
            selection_start = scrollable_list->selection_line_start_pos;
            selection_end = scrollable_list->selection_line_end_pos;
        }
        else if(scrollable_list->selection_mode != ScrollableList_SelectionMode_NoSelection)
            selection_end = strlen(item);
    }

    ScrollableList_painRowTextWithSelection(line_index, item, selection_start, selection_end, scrollable_list->window);
}

void ScrollableList_paintRow(ScrollableList* scrollable_list, int line_index) {
    ScrollableListItem * node = ScrollableListItem_getItemN(scrollable_list->displayed_items, line_index);

    ScrollableList_paintRowText(
        line_index,
        node->text,
        scrollable_list
    );
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

    int max_displayed_lines = ScrollableList_getScreenMaxDisplayedLines(scrollable_list);

    if (displayed_items_count < max_displayed_lines) {
        for(i = displayed_items_count; i < max_displayed_lines; i++) {
            ScrollableList_paintRowText(
                i,
                " ",
                scrollable_list
            );
        }
    }

    wrefresh(scrollable_list->window);
    box(scrollable_list->window, 0, 0);
}

ScrollableList ScrollableList_create(struct ScrollableListCreateOpts opts) {
    ScrollableList scrollable_list;

    scrollable_list.all_items = opts.all_items;
    scrollable_list.displayed_items = NULL;
    scrollable_list.width = opts.list_width;
    scrollable_list.height = opts.list_height;
    scrollable_list.selected_line_index = 0;
    scrollable_list.first_displayed_item_index = 0;
    scrollable_list.should_center_text = opts.should_center_text;
    scrollable_list.window = opts.window;
    scrollable_list.selection_mode = opts.selection_mode;

    ScrollableList_refreshList(&scrollable_list);

    ScrollableList_paintScreenItems(&scrollable_list);

    wrefresh(opts.window);

    keypad(opts.window, TRUE);
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

        ScrollableListItem_destroyItems(scrollable_list->displayed_items);

        scrollable_list->displayed_items =
            ScrollableListItem_getNItems(
                first_item,
                ScrollableList_getScreenMaxDisplayedLines(scrollable_list)
            );
    }

    scrollable_list->onMove(scrollable_list->first_displayed_item_index + scrollable_list->selected_line_index);
}

void ScrollableList_handleEnter(ScrollableList * scrollable_list) {
    int absolute_index = scrollable_list->first_displayed_item_index + scrollable_list->selected_line_index;

    scrollable_list->onEnter(scrollable_list, absolute_index);
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
                ScrollableList_getScreenMaxDisplayedLines(scrollable_list) * -1
            );
        }
        else if (ch == KEY_NPAGE)
        {
            ScrollableList_tryToMoveSelectedLine(
                scrollable_list,
                ScrollableList_getScreenMaxDisplayedLines(scrollable_list)
            );
        }
        else if (ch == KEY_ENTER_FIXED)
        {
            ScrollableList_handleEnter(scrollable_list);
        }

        ScrollableList_paintScreenItems(scrollable_list);

        if(scrollable_list->all_items == NULL ||
            scrollable_list->displayed_items == NULL) {
            break;
        }
    }
}

void ScrollableList_refreshAndPaintList(ScrollableList * scrollable_list) {
    ScrollableList_refreshList(scrollable_list);
    ScrollableList_paintScreenItems(scrollable_list);
}

void ScrollableList_destroyWithItems(ScrollableList * scrollable_list) {
    ScrollableListItem_destroyItems(scrollable_list->all_items);
    ScrollableListItem_destroyItems(scrollable_list->displayed_items);
}
