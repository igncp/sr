#include <stdbool.h>
#include <string.h>
#include <stdlib.h>

#include "scrollable_list.h"
#include "str_utils_c.h"

#define KEY_ENTER_FIXED 10
#define LEFT_SCROLL_SYMBOL "[..]"

int ScrollableList_getScreenMaxDisplayedLines(ScrollableList * scrollable_list)
{
    return scrollable_list->height - 2;
}

int ScrollableList_getMaxFullLineWidth(ScrollableList * scrollable_list)
{
    return scrollable_list->width - 3;
}

int ScrollableList_getMaxLineContentWidth(
    ScrollableList * scrollable_list,
    int digits_for_items
)
{
    int line_number_fragment = 0;

    if (scrollable_list->should_display_line_numbers)
    {
        line_number_fragment += 1 + digits_for_items;
    }

    return ScrollableList_getMaxFullLineWidth(scrollable_list) - line_number_fragment;
}

ScrollableListItem * ScrollableListItem_create(char * text)
{
    ScrollableListItem * item = malloc(sizeof(ScrollableListItem));

    item->text = malloc(sizeof(char) * strlen(text) + 1);
    strcpy(item->text, text);

    item->next = NULL;

    return item;
}

ScrollableListItem * ScrollableListItem_getLast(ScrollableListItem * items)
{
    ScrollableListItem * node = items;

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        if (node->next == NULL)
        {
            break;
        }

        node = node->next;
    }

    return node;
}

int ScrollableListItem_getCount(ScrollableListItem * items)
{
    int count = 0;
    ScrollableListItem * node = items;

    while(true)
    {
        if (node == NULL)
        {
            break;
        }

        node = node->next;
        count++;
    }

    return count;
}

ScrollableListItem * ScrollableListItem_getItemN(ScrollableListItem * items, int n)
{
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

void ScrollableListItem_destroyItems(ScrollableListItem * items)
{
    ScrollableListItem * node = items;

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        ScrollableListItem * r = node->next;

        if (node->text)
        {
            free(node->text);
        }
        free(node);

        node = r;
    }
}

ScrollableListItem * ScrollableListItem_getNItems(ScrollableListItem* items, int n)
{
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

void ScrollableList_refreshList(ScrollableList * scrollable_list)
{
    ScrollableListItem_destroyItems(scrollable_list->displayed_items);

    int all_items_count = ScrollableListItem_getCount(scrollable_list->all_items);
    int max_first_displayed_item_index = all_items_count - ScrollableList_getScreenMaxDisplayedLines(scrollable_list);

    if (max_first_displayed_item_index < 0) max_first_displayed_item_index = 0;

    if (scrollable_list->first_displayed_item_index > max_first_displayed_item_index)
    {
        scrollable_list->first_displayed_item_index = max_first_displayed_item_index;
    }
    else if (scrollable_list->first_displayed_item_index < 0)
    {
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

    if (scrollable_list->selected_line_index >= displayed_items_count)
    {
        scrollable_list->selected_line_index = displayed_items_count - 1;
    }
}

struct LineSelection
{
    int selection_start;
    int selection_end;
};

void ScrollableList_paintRowTextWithSelection(
    ScrollableList * scrollable_list,
    int line_index,
    char * text,
    struct LineSelection * line_selection
)
{
    int line_number = line_index + 1;
    int full_text_len = strlen(text);
    int max_len = scrollable_list->width;
    char * printed_text = NULL;

    if (max_len >= full_text_len)
    {
        printed_text = strdup(text);
    }
    else
    {
        printed_text = malloc(sizeof(char) * max_len + 1);

        snprintf(printed_text, max_len - 1, "%s", text);
        printed_text[max_len] = 0;
    }

    if (line_selection->selection_start >= max_len)
    {
        line_selection->selection_start = max_len - 1;
    }

    if (line_selection->selection_end >= max_len)
    {
        line_selection->selection_end  = max_len - 1;
    }

    if (line_selection->selection_start > 0)
    {
        char subbuff[line_selection->selection_start];
        memcpy(subbuff, &printed_text[0], line_selection->selection_start);
        subbuff[line_selection->selection_start] = 0;

        wattroff(scrollable_list->window, A_STANDOUT);

        mvwprintw(scrollable_list->window, line_number, 1, "%s", subbuff);
    }

    if (line_selection->selection_start != line_selection->selection_end)
    {
        char subbuff[line_selection->selection_end - line_selection->selection_start];
        memcpy(
            subbuff,
            &printed_text[line_selection->selection_start],
            line_selection->selection_end - line_selection->selection_start
        );
        subbuff[line_selection->selection_end - line_selection->selection_start] = 0;

        wattron(scrollable_list->window, A_STANDOUT);

        mvwprintw(scrollable_list->window, line_number, 1 + line_selection->selection_start, "%s", subbuff);
    }

    wattroff(scrollable_list->window, A_STANDOUT);

    if (line_selection->selection_end < max_len - 1)
    {
        char subbuff[max_len - line_selection->selection_end];
        memcpy(
            subbuff,
            &printed_text[line_selection->selection_end],
            max_len - 1 - line_selection->selection_end
        );
        subbuff[max_len - line_selection->selection_end] = 0;

        mvwprintw(scrollable_list->window, line_number, 1 + line_selection->selection_end, "%s", subbuff);
    }

    free(printed_text);
}

char * ScrollableList_createRowTextWithLeftPad(
    ScrollableList * scrollable_list,
    const char * text
)
{
    char * rowText = malloc(sizeof(char) * 1024);
    int max_line_width = ScrollableList_getMaxFullLineWidth(scrollable_list);
    int text_len = strlen(text);
    int spaces_len = max_line_width - text_len;
    char * leftpad = NULL;

    if (scrollable_list->should_center_text)
    {
        int leftpad_num = spaces_len / 2;
        leftpad = malloc(sizeof(char) * leftpad_num + 1);

        strcpy(leftpad, " ");
        for (int i = 0; i < leftpad_num - 1; i++)
        {
            strcat(leftpad, " ");
        }
    }
    else
    {
        leftpad = malloc(sizeof(char) + 1);
        strcpy(leftpad, " ");
    }

    snprintf(
        rowText,
        max_line_width,
        "%s%s",
        leftpad,
        text
    );

    free(leftpad);

    int spaces_len_right = max_line_width - strlen(rowText);
    for (int i = 0; i <= spaces_len_right; i++)
    {
        strcat(rowText, " ");
    }

    return rowText;
}

struct LineSelection * ScrollableList_getSelectionToList(
    ScrollableList * scrollable_list,
    int line_index,
    char * row_text
)
{
    struct LineSelection * line_selection = malloc(sizeof(struct LineSelection));
    line_selection->selection_start = 0;
    line_selection->selection_end = 0;

    if (line_index == scrollable_list->selected_line_index)
    {
        if (scrollable_list->selection_mode == ScrollableList_SelectionMode_LineFragment)
        {
            int extra = (scrollable_list->left_scroll > 0)
                ? scrollable_list->left_scroll - strlen(LEFT_SCROLL_SYMBOL)
                : 0;

            line_selection->selection_start = scrollable_list->selection_line_start_pos - extra;
            line_selection->selection_end = scrollable_list->selection_line_end_pos - extra;
        }
        else if(scrollable_list->selection_mode != ScrollableList_SelectionMode_NoSelection)
            line_selection->selection_end = strlen(row_text);
    }

    return line_selection;
}

void ScrollableList_addLineNumberToRowIfNecessary(
    ScrollableList * scrollable_list,
    char * row_text,
    int digits_for_items,
    int line_index,
    int all_items_count,
    struct LineSelection * line_selection
)
{
    if (scrollable_list->should_display_line_numbers &&
        all_items_count > line_index)
    {
        int line_absolute_number = line_index + 1 + scrollable_list->first_displayed_item_index;
        int digits_for_line = StrUtils_getDigitsForNumber(line_absolute_number);
        int digits_diff = digits_for_items - digits_for_line;

        char * number_text = malloc(sizeof(char) * digits_for_line + 1);

        sprintf(
            number_text,
            "%d",
            line_absolute_number
        );
        number_text[digits_for_line] = 0;

        int new_line_chars = digits_for_items + 1; // the extra is a space
        char * number_text_with_spaces = malloc(sizeof(char) * new_line_chars + 1);

        strcpy(number_text_with_spaces, " ");
        for (int i = 0; i < digits_diff; i++)
        {
            strcat(number_text_with_spaces, " ");
        }
        strcat(number_text_with_spaces, number_text);

        number_text_with_spaces[digits_for_items + 1] = 0;

        char * orig_row_text = strdup(row_text);

        snprintf(
            row_text,
            ScrollableList_getMaxFullLineWidth(scrollable_list),
            "%s%s",
            number_text_with_spaces,
            orig_row_text
        );

        line_selection->selection_start += new_line_chars;
        line_selection->selection_end += new_line_chars;

        free(orig_row_text);
        free(number_text_with_spaces);
        free(number_text);
    }
}

char * ScrollableList_createRowTextWithLeftScroll(
    ScrollableList * scrollable_list,
    const char * text
)
{
    char * text_dup = strdup(text);
    char * orig_text_dup = text_dup;
    char * row_text_with_scroll = NULL;

    if (scrollable_list->left_scroll)
    {
        if (strlen(text_dup) > scrollable_list->left_scroll)
        {
            text_dup += scrollable_list->left_scroll;
            row_text_with_scroll = StrUtils_createStrWithTwoStrings(LEFT_SCROLL_SYMBOL, text_dup);
        }
        else
        {
            row_text_with_scroll = strdup("");
        }
    }
    else
    {
        row_text_with_scroll = strdup(text_dup);
    }

    free(orig_text_dup);

    return row_text_with_scroll;
}

void ScrollableList_paintRowText(
    int line_index,
    const char * text,
    ScrollableList * scrollable_list,
    int digits_for_items,
    int all_items_count
)
{
    char * row_text_with_scroll = ScrollableList_createRowTextWithLeftScroll(
            scrollable_list,
            text
        );

    char * row_text_with_left_pad = ScrollableList_createRowTextWithLeftPad(
            scrollable_list,
            row_text_with_scroll
        );

    struct LineSelection * line_selection = ScrollableList_getSelectionToList(
            scrollable_list,
            line_index,
            row_text_with_left_pad
        );

    ScrollableList_addLineNumberToRowIfNecessary(
        scrollable_list,
        row_text_with_left_pad,
        digits_for_items,
        line_index,
        all_items_count,
        line_selection
    );

    ScrollableList_paintRowTextWithSelection(
        scrollable_list,
        line_index,
        row_text_with_left_pad,
        line_selection
    );

    free(row_text_with_scroll);
    free(row_text_with_left_pad);
    free(line_selection);
}

void ScrollableList_setLeftScroll(ScrollableList * scrollable_list, int digits_for_items)
{
    scrollable_list->left_scroll = 0;

    if (scrollable_list->selection_mode == ScrollableList_SelectionMode_LineFragment)
    {
        int max_line_width = ScrollableList_getMaxLineContentWidth(scrollable_list, digits_for_items);

        if (scrollable_list->selection_line_start_pos > max_line_width)
        {
            scrollable_list->left_scroll = scrollable_list->selection_line_start_pos - max_line_width / 3;
        }
    }
}

void ScrollableList_paintScreenItems(ScrollableList * scrollable_list)
{
    ScrollableListItem * node = scrollable_list->displayed_items;

    int displayed_items_count = ScrollableListItem_getCount(node);
    int all_items_count = ScrollableListItem_getCount(scrollable_list->all_items);
    int digits_for_items = StrUtils_getDigitsForNumber(all_items_count);

    ScrollableList_setLeftScroll(scrollable_list, digits_for_items);

    int i = 0;

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        ScrollableListItem * item = ScrollableListItem_getItemN(scrollable_list->displayed_items, i);

        ScrollableList_paintRowText(
            i,
            item->text,
            scrollable_list,
            digits_for_items,
            all_items_count
        );

        wrefresh(scrollable_list->window);

        node = node->next;
        i++;
    }

    int max_displayed_lines = ScrollableList_getScreenMaxDisplayedLines(scrollable_list);

    if (displayed_items_count < max_displayed_lines)
    {
        for(i = displayed_items_count; i < max_displayed_lines; i++)
        {
            ScrollableList_paintRowText(
                i,
                " ",
                scrollable_list,
                digits_for_items,
                all_items_count
            );
        }
    }

    wrefresh(scrollable_list->window);
    box(scrollable_list->window, 0, 0);
}

void noopKeyFn(struct ScrollableList* l, int selected_index) {}

ScrollableList ScrollableList_create(struct ScrollableListCreateOpts opts)
{
    ScrollableList scrollable_list;

    scrollable_list.all_items = opts.all_items;
    scrollable_list.displayed_items = NULL;
    scrollable_list.width = opts.list_width;
    scrollable_list.height = opts.list_height;
    scrollable_list.left_scroll = 0;
    scrollable_list.selected_line_index = 0;
    scrollable_list.first_displayed_item_index = 0;
    scrollable_list.should_center_text = opts.should_center_text;
    scrollable_list.should_display_line_numbers = opts.should_display_line_numbers;
    scrollable_list.window = opts.window;
    scrollable_list.selection_mode = opts.selection_mode;

    scrollable_list.onKey_r_Pressed = &noopKeyFn;
    scrollable_list.onEnter = &noopKeyFn;

    ScrollableList_refreshList(&scrollable_list);

    ScrollableList_paintScreenItems(&scrollable_list);

    wrefresh(scrollable_list.window);

    keypad(opts.window, TRUE);
    curs_set(0);

    noecho();

    return scrollable_list;
}

void ScrollableList_tryToMoveSelectedLine(ScrollableList * scrollable_list, int movement_positions)
{
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

            if (is_inside_list)
            {
                scrollable_list->selected_line_index = current_index;
            }
            else
            {
                scrollable_list->selected_line_index = displayed_items_count - 1;
            }
        }
        else if (scrollable_list->selected_line_index < 0)
        {
            scrollable_list->first_displayed_item_index += movement_positions;

            if (is_inside_list)
            {
                scrollable_list->selected_line_index = current_index;
            }
            else
            {
                scrollable_list->selected_line_index = 0;
            }
        }

        int first_displayed_diff = scrollable_list->first_displayed_item_index - max_first_displayed;

        if (first_displayed_diff > 0)
        {
            if (scrollable_list->selected_line_index + first_displayed_diff < displayed_items_count)
            {
                scrollable_list->selected_line_index += first_displayed_diff;
            }
            scrollable_list->first_displayed_item_index = max_first_displayed;
        }
        else if (scrollable_list->first_displayed_item_index < 0)
        {
            if (scrollable_list->selected_line_index + scrollable_list->first_displayed_item_index >= 0)
            {
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

void ScrollableList_waitForKey(ScrollableList * scrollable_list)
{
    int ch;
    while((ch = wgetch(scrollable_list->window)) != 'q')
    {
        int absolute_index =
            scrollable_list->first_displayed_item_index + scrollable_list->selected_line_index;

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
            scrollable_list->onEnter(scrollable_list, absolute_index);
        }
        else if (ch == 'r')
        {
            scrollable_list->onKey_r_Pressed(scrollable_list, absolute_index);
        }

        ScrollableList_paintScreenItems(scrollable_list);

        if(scrollable_list->all_items == NULL ||
            scrollable_list->displayed_items == NULL)
        {
            break;
        }
    }
}

void ScrollableList_refreshAndPaintList(ScrollableList * scrollable_list)
{
    ScrollableList_refreshList(scrollable_list);
    ScrollableList_paintScreenItems(scrollable_list);
}

void ScrollableList_destroyWithItems(ScrollableList * scrollable_list)
{
    ScrollableListItem_destroyItems(scrollable_list->all_items);
    ScrollableListItem_destroyItems(scrollable_list->displayed_items);
}
