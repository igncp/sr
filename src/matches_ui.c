#include "matches_ui.h"

#include <curses.h>
#include <stdlib.h>
#include <string.h>

#include "match_item.h"
#include "scrollable_list.h"
#include "file_io.h"

static MatchItem * g_all_matched_items;
static ScrollableList * g_preview_list;

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

ScrollableListItem * MatchesUI_getPreviewListItems(int absolute_selected_index) {
    MatchItem * item = MatchItem_getItemN(g_all_matched_items, absolute_selected_index);
    char * file_content = FileIO_getFileContent(item->path);

    ScrollableListItem * scrollable_list_items = NULL;

    char * pch;
    pch = strtoke(file_content, "\n");
    while (true)
    {
        if (pch == NULL) {
            break;
        }

        ScrollableListItem * r = malloc(sizeof(ScrollableListItem));

        r->text = malloc(sizeof(char) * strlen(pch) + 1);
        sprintf(r->text, "%s", pch);
        r->next = NULL;

        if (scrollable_list_items == NULL) {
            scrollable_list_items = r;
        } else {
            ScrollableListItem_getLast(scrollable_list_items)->next = r;
        }

        pch = strtoke(NULL, "\n");
    }

    return scrollable_list_items;
}

void MatchesUI_handleMatchesListMove(int absolute_selected_index) {
    ScrollableListItem_destroyItems(g_preview_list->all_items);

    ScrollableListItem * preview_items = MatchesUI_getPreviewListItems(absolute_selected_index);

    g_preview_list->all_items = preview_items;

    ScrollableList_refreshAndPaintList(g_preview_list);
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

void MatchesUI_listMatches(MatchItem * all_matched_item)
{
    g_all_matched_items = all_matched_item;

    initscr();

    ScrollableListItem * matches_scrollable_list_items = MatchesUI_getAllMatchesListItems();
    ScrollableListItem * preview_list_items = MatchesUI_getPreviewListItems(0);

    long total_width = COLS - 1;
    long list_width = total_width / 2 - 1;

    WINDOW * matches_window = newwin(LINES - 1, list_width, 1, 1);
    WINDOW * preview_window = newwin(LINES - 1, list_width, 1, list_width + 1);

    ScrollableList scrollable_list = ScrollableList_create(matches_scrollable_list_items, matches_window, list_width, true);
    ScrollableList preview_list = ScrollableList_create(preview_list_items, preview_window, list_width, false);

    g_preview_list = &preview_list;

    scrollable_list.onEnter = &MatchesUI_handleMatchesListEnter;
    scrollable_list.onMove = &MatchesUI_handleMatchesListMove;

    ScrollableList_waitForKey(&scrollable_list);

    delwin(matches_window);
    delwin(preview_window);

    endwin();
}
