#include "matches_ui.h"

#include <curses.h>
#include <stdlib.h>
#include <string.h>

#include "common_types.h"
#include "match_item.h"
#include "scrollable_list.h"
#include "file_io.h"

static MatchItem * g_all_matched_items;
static ScrollableList * g_preview_list;
static ScrollableList * g_header_list;

char* strtoke(char *str, const char *delim)
{
  static char *start = NULL;
  char *token = 0;

  if (str)
      start = str;
  if (!start)
      return NULL;

  token = start;
  start = strpbrk(start, delim);

  if (start)
      *start++ = '\0';

  return token;
}

ScrollableListItem * MatchesUI_getAllMatchesListItems(void) {
    MatchItem * node = g_all_matched_items;
    ScrollableListItem * scrollable_list_items = NULL;
    ScrollableListItem * last = NULL;

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
            last->next = r;
        }
        last = r;

        node = node->next;
    }

    return scrollable_list_items;
}

int getDigitsForNumber(int number) {
    int digits = 1;
    double count_for_digits = number;

    while (true) {
        count_for_digits = count_for_digits / 10;

        if (count_for_digits < 1) {
            break;
        };

        digits++;
    }

    return digits;
}

void MatchesUI_addLineNumbersToPreviewItems(ScrollableListItem * preview_items, int items_count) {
    ScrollableListItem * node = preview_items;

    int total_digits = getDigitsForNumber(items_count);
    int counter = 1;

    while (true) {
        if (node == NULL) {
            break;
        }

        char * line_with_number = malloc(1024);
        int digits_of_line = getDigitsForNumber(counter);

        sprintf(line_with_number, "%d", counter);
        for (int i = 0; i <= (total_digits - digits_of_line); i++) {
            strcat(line_with_number, " ");
        }
        strcat(line_with_number, node->text);
        free(node->text);

        node->text = line_with_number;

        node = node->next;
        counter++;
    }
}

ScrollableListItem * MatchesUI_getPreviewListItems(int absolute_selected_index) {
    MatchItem * item = MatchItem_getItemN(g_all_matched_items, absolute_selected_index);

    if (item == NULL) {
        return NULL;
    }

    char * file_content = FileIO_getFileContent(item->path);

    ScrollableListItem * scrollable_list_items = NULL;
    ScrollableListItem * last = NULL;

    char * pch;
    int counter = 0;
    pch = strtoke(file_content, "\n");
    while (true)
    {
        if (pch == NULL) {
            break;
        }

        if (counter == 300) {
            break;
        }

        ScrollableListItem * r = malloc(sizeof(ScrollableListItem));

        r->text = malloc(sizeof(char) * strlen(pch) + 1);
        sprintf(r->text, "%s", pch);
        r->next = NULL;

        if (scrollable_list_items == NULL) {
            scrollable_list_items = r;
            last = r;
        } else {
            last->next = r;
            last = r;
        }

        pch = strtoke(NULL, "\n");
        counter++;
    }

    int items_count = ScrollableListItem_getCount(scrollable_list_items);
    ScrollableListItem * p = ScrollableListItem_getItemN(scrollable_list_items, items_count - 2);

    if (p != NULL) {
        p->next = NULL;
    }

    MatchesUI_addLineNumbersToPreviewItems(scrollable_list_items, items_count);

    return scrollable_list_items;
}

ScrollableListItem * MatchesUI_getHeaderItems(int selected_match_index, ParsedOpts * parsed_opts) {
    MatchItem * selected_match_item = MatchItem_getItemN(g_all_matched_items, selected_match_index);

    char * empty_line = malloc(2);
    snprintf(empty_line, 2, "%s", " ");

    int count = MatchItem_countList(g_all_matched_items);
    char * count_line = malloc(30);
    snprintf(count_line, 30, "%d / %d", selected_match_index + 1, count);

    if (selected_match_item == NULL) {
        return NULL;
    }

    ScrollableListItem * header_item_match_path = ScrollableListItem_create(selected_match_item->path);
    ScrollableListItem * header_items = ScrollableListItem_create(empty_line);
    ScrollableListItem * count_line_item = ScrollableListItem_create(count_line);

    ScrollableListItem * header_item_opts = NULL;
    if (parsed_opts == NULL) {
        header_item_opts = ScrollableListItem_create(g_header_list->all_items->next->next->next->text);
    } else {
        char * opts_line = malloc(1024);
        snprintf(
            opts_line,
            1024,
            "%s - '%s' '%s'",
            parsed_opts->searchPath,
            parsed_opts->searchPattern,
            parsed_opts->searchReplacement
        );

        header_item_opts = ScrollableListItem_create(opts_line);
    }

    header_items->next = count_line_item;
    count_line_item->next = header_item_match_path;
    header_item_match_path->next = header_item_opts;

    return header_items;
}

void MatchesUI_handleMatchesListMove(int absolute_selected_index) {
    ScrollableListItem * preview_items = MatchesUI_getPreviewListItems(absolute_selected_index);
    ScrollableListItem_destroyItems(g_preview_list->all_items);
    g_preview_list->all_items = preview_items;

    ScrollableListItem * header_items = MatchesUI_getHeaderItems(absolute_selected_index, NULL);
    ScrollableListItem_destroyItems(g_header_list->all_items);
    g_header_list->all_items = header_items;

    ScrollableList_refreshAndPaintList(g_preview_list);
    ScrollableList_refreshAndPaintList(g_header_list);
}

void MatchesUI_handleMatchesListEnter(ScrollableList * scrollable_list, int absolute_index) {
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

    int items_count = MatchItem_countList(g_all_matched_items);

    if (items_count == 0) {
        scrollable_list->all_items = NULL;

        return;
    }

    scrollable_list->all_items = MatchesUI_getAllMatchesListItems();

    ScrollableList_refreshAndPaintList(scrollable_list);

    MatchesUI_handleMatchesListMove(scrollable_list->first_displayed_item_index + scrollable_list->selected_line_index);
}

void MatchesUI_listMatches(ParsedOpts * parsed_opts, MatchItem * all_matched_item)
{
    if (all_matched_item == NULL) {
        return;
    }

    g_all_matched_items = all_matched_item;

    initscr();

    ScrollableListItem * matches_scrollable_list_items = MatchesUI_getAllMatchesListItems();
    ScrollableListItem * preview_list_items = MatchesUI_getPreviewListItems(0);

    long total_width = COLS - 1;
    long total_height = LINES ;

    long header_height = 7;
    long list_width = total_width / 2;
    long list_height = total_height - header_height - 1;

    WINDOW * matches_window = newwin(list_height, list_width, total_height - list_height, 1);
    WINDOW * preview_window = newwin(list_height, list_width, total_height - list_height, list_width + 1);

    ScrollableList scrollable_list =
        ScrollableList_create(matches_scrollable_list_items, matches_window, list_width, list_height, true, false);
    ScrollableList preview_list =
        ScrollableList_create(preview_list_items, preview_window, list_width, list_height, false, false);

    ScrollableListItem * header_list_items = MatchesUI_getHeaderItems(0, parsed_opts);
    WINDOW * header_window = newwin(header_height, total_width, 1, 1);
    ScrollableList header_list =
        ScrollableList_create(header_list_items, header_window, total_width, header_height, false, true);

    g_preview_list = &preview_list;
    g_header_list = &header_list;

    scrollable_list.onEnter = &MatchesUI_handleMatchesListEnter;
    scrollable_list.onMove = &MatchesUI_handleMatchesListMove;

    ScrollableList_waitForKey(&scrollable_list);

    delwin(matches_window);
    delwin(preview_window);

    endwin();
}
