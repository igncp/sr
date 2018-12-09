#include "matches_ui.h"

#include <curses.h>
#include <stdlib.h>
#include <string.h>

#include "match_item.h"
#include "scrollable_list.h"
#include "file_io_c.h"
#include "file_item_c.h"
#include "str_utils_c.h"
#include "search.h"

static MatchItem * g_all_matched_items;
static ScrollableList * g_preview_list;
static ScrollableList * g_header_list;
static char * g_search_pattern;
static char * g_search_replacement;
static bool g_should_be_case_insensitive;
const char * too_many_lines_text = "... [sr: TOO MANY LINES] ...";

ScrollableListItem * MatchesUI_getAllMatchesListItems(void)
{
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

        r->text = malloc(sizeof(char) * 1024);
        snprintf(r->text, 1024, "%ld / %ld - %s", node->index + 1, node->total, node->path);
        r->next = NULL;

        if (scrollable_list_items == NULL)
        {
            scrollable_list_items = r;
        }
        else
        {
            last->next = r;
        }
        last = r;

        node = node->next;
    }

    return scrollable_list_items;
}

#define MATCHES_UI_MAX_SPLIT_LINES 2000

ScrollableListItem * MatchesUI_getPreviewListItems(int absolute_selected_index)
{
    MatchItem * item = MatchItem_getItemN(g_all_matched_items, absolute_selected_index);

    if (item == NULL)
    {
        return NULL;
    }

    char * file_content = FileIO_getFileContent(item->path);

    struct Search_RegexPositions match_position = getPositionsInStrOfRegexMatchIdx(
            file_content,
            g_search_pattern,
            item->index,
            g_should_be_case_insensitive
        );
    ScrollableListItem * scrollable_list_items = NULL;
    ScrollableListItem * last = NULL;

    match_position.start += 1;

    struct StrUtils_Line * lines = StrUtils_Line_splitStrInLines(
            file_content,
            MATCHES_UI_MAX_SPLIT_LINES
        );

    free(file_content);

    struct StrUtils_Line * node = lines;
    int text_len_covered = 0;
    int match_line_index = 0;
    int pos_at_match_line = 0;

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        text_len_covered += strlen(node->text) + 1;

        if (text_len_covered < match_position.start)
        {
            match_line_index += 1;
            pos_at_match_line += strlen(node->text) + 1;
        }

        ScrollableListItem * r = ScrollableListItem_create(node->text);

        if (scrollable_list_items == NULL)
        {
            scrollable_list_items = r;
            last = r;
        }
        else
        {
            last->next = r;
            last = r;
        }

        node = node->next;
    }

    StrUtils_Line_destroyList(lines);

    int items_count = ScrollableListItem_getCount(scrollable_list_items);
    ScrollableListItem * p = ScrollableListItem_getItemN(scrollable_list_items, items_count - 2);

    if (p != NULL)
    {
        ScrollableListItem_destroyItems(p->next);
        p->next = NULL;
    }

    if (match_line_index < items_count)
    {
        int half_displayed_screen = g_preview_list->height / 2;
        g_preview_list->first_displayed_item_index = match_line_index - half_displayed_screen + 2;

        if (match_line_index < half_displayed_screen)
        {
            g_preview_list->selected_line_index = match_line_index;
        }
        else if ((items_count - match_line_index) < half_displayed_screen)
        {
            g_preview_list->selected_line_index = g_preview_list->height - (items_count - match_line_index) - 1;
        }
        else
        {
            g_preview_list->selected_line_index = half_displayed_screen - 2;
        }

        ScrollableListItem * highligted_line = ScrollableListItem_getItemN(scrollable_list_items, match_line_index);

        if (highligted_line != NULL)
        {
            int start_of_replacement = match_position.start - pos_at_match_line - 1;
            char * text_to_free = highligted_line->text;

            char * new_line_content = StrUtils_createStrWithFragmentReplaced(
                    highligted_line->text,
                    start_of_replacement,
                    match_position.end_relative,
                    g_search_replacement
                );

            highligted_line->text = new_line_content;

            free(text_to_free);

            g_preview_list->selection_line_start_pos = start_of_replacement + 1;
            g_preview_list->selection_line_end_pos = g_preview_list->selection_line_start_pos + strlen(g_search_replacement);
        }
    }
    else
    {
        char * too_many_lines_ptr = malloc(sizeof(char) * strlen(too_many_lines_text) + 1);
        strcpy(too_many_lines_ptr, too_many_lines_text);
        ScrollableListItem * r = ScrollableListItem_create(too_many_lines_ptr);
        free(too_many_lines_ptr);
        ScrollableListItem * l = ScrollableListItem_getLast(scrollable_list_items);

        l->next = r;

        g_preview_list->selection_line_start_pos = 0;
        g_preview_list->selection_line_end_pos = g_preview_list->width;
        g_preview_list->first_displayed_item_index = items_count + 2;
        g_preview_list->selected_line_index = g_preview_list->height;
    }


    return scrollable_list_items;
}

ScrollableListItem * MatchesUI_getHeaderItems(int selected_match_index, ParsedOpts * parsed_opts)
{
    MatchItem * selected_match_item = MatchItem_getItemN(g_all_matched_items, selected_match_index);

    char * empty_line = malloc(sizeof(char) + 1);
    snprintf(empty_line, 2, "%s", " ");
    empty_line[1] = 0;

    int count = MatchItem_countList(g_all_matched_items);
    char * count_line = malloc(30);
    snprintf(count_line, 30, "%d / %d", selected_match_index + 1, count);

    if (selected_match_item == NULL)
    {
        return NULL;
    }

    ScrollableListItem * header_item_match_path = ScrollableListItem_create(selected_match_item->path);
    ScrollableListItem * header_items = ScrollableListItem_create(empty_line);
    ScrollableListItem * count_line_item = ScrollableListItem_create(count_line);

    ScrollableListItem * header_item_opts = NULL;
    if (parsed_opts == NULL)
    {
        header_item_opts = ScrollableListItem_create(g_header_list->all_items->next->next->next->text);
    }
    else
    {
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

        free(opts_line);
    }

    header_items->next = count_line_item;
    count_line_item->next = header_item_match_path;
    header_item_match_path->next = header_item_opts;

    free(empty_line);
    free(count_line);

    return header_items;
}

void MatchesUI_updatePreviewList(int absolute_selected_index)
{
    ScrollableListItem * preview_items = MatchesUI_getPreviewListItems(absolute_selected_index);
    ScrollableListItem_destroyItems(g_preview_list->all_items);
    g_preview_list->all_items = preview_items;

    ScrollableList_refreshAndPaintList(g_preview_list);
}

void MatchesUI_handleMatchesListMove(int absolute_selected_index)
{
    ScrollableListItem * header_items = MatchesUI_getHeaderItems(absolute_selected_index, NULL);
    ScrollableListItem_destroyItems(g_header_list->all_items);
    g_header_list->all_items = header_items;
    ScrollableList_refreshAndPaintList(g_header_list);

    MatchesUI_updatePreviewList(absolute_selected_index);
}

void MatchesUI_replaceMatchIndexInFile(int absolute_selected_index)
{
    MatchItem * item = MatchItem_getItemN(g_all_matched_items, absolute_selected_index);

    if (item == NULL)
    {
        return;
    }

    char * file_content = FileIO_getFileContent(item->path);

    struct Search_RegexPositions match_position = getPositionsInStrOfRegexMatchIdx(
            file_content,
            g_search_pattern,
            item->index,
            g_should_be_case_insensitive
        );

    char * new_file_content = StrUtils_createStrWithFragmentReplaced(
            file_content,
            match_position.start,
            match_position.end_relative,
            g_search_replacement
        );

    free(file_content);

    FileIO_setFileContent(item->path, new_file_content);

    free(new_file_content);
}

void MatchesUI_updateMatchesForFile(char * file_path)
{
    MatchItem * first_node_not_of_path = NULL;
    MatchItem * first_node_prev_of_path = NULL;
    MatchItem * items_of_path = NULL;
    MatchItem * items_of_path_last = NULL;

    MatchItem * node = g_all_matched_items;
    MatchItem * node_prev = NULL;

    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        MatchItem * next_node = node->next;

        if (strcmp(node->path, file_path) == 0)
        {
            if (node_prev != NULL)
            {
                node_prev->next = NULL;
            }

            node->next = NULL;

            if (items_of_path == NULL)
            {
                first_node_prev_of_path = node_prev;
                items_of_path = node;
            }
            else
            {
                items_of_path_last->next = node;
            }

            items_of_path_last = node;
        }
        else
        {
            if (node_prev != NULL)
            {
                node_prev->next = node;
            }

            if (first_node_not_of_path == NULL)
            {
                first_node_not_of_path = node;
            }

            node_prev = node;
        }

        node = next_node;
    }

    MatchItem_deleteList(items_of_path);

    g_all_matched_items = first_node_not_of_path;

    FileItem file_item =
    {
        .path = file_path,
        .next = NULL
    };

    MatchItem * new_path_items = getRegexMatchesFromFiles(
            &file_item,
            g_search_pattern,
            g_should_be_case_insensitive
        );

    if (new_path_items == NULL)
    {
        return;
    }

    if (first_node_prev_of_path == NULL)
    {
        MatchItem_getLast(new_path_items)->next = g_all_matched_items;
        g_all_matched_items = new_path_items;
    }
    else
    {
        MatchItem * next = first_node_prev_of_path->next;
        first_node_prev_of_path->next = new_path_items;
        MatchItem_getLast(new_path_items)->next = next;
    }
}

void MatchesUI_refreshItemsForPath(ScrollableList * scrollable_list, MatchItem * item)
{
    char * path = malloc(sizeof(char) * strlen(item->path) + 1);
    strcpy(path, item->path);

    ScrollableListItem_destroyItems(scrollable_list->all_items);

    MatchesUI_updateMatchesForFile(path);

    free(path);

    int items_count = MatchItem_countList(g_all_matched_items);

    if (items_count == 0)
    {
        scrollable_list->all_items = NULL;

        return;
    }

    scrollable_list->all_items = MatchesUI_getAllMatchesListItems();

    ScrollableList_refreshAndPaintList(scrollable_list);

    MatchesUI_handleMatchesListMove(
        scrollable_list->first_displayed_item_index + scrollable_list->selected_line_index
    );
}

void MatchesUI_handleKey_r_Pressed(ScrollableList * scrollable_list, int absolute_index)
{
    MatchItem * item = MatchItem_getItemN(g_all_matched_items, absolute_index);

    MatchesUI_refreshItemsForPath(scrollable_list, item);
}

void MatchesUI_handleMatchesListEnter(ScrollableList * scrollable_list, int absolute_index)
{
    MatchItem * item = MatchItem_getItemN(g_all_matched_items, absolute_index);

    MatchesUI_replaceMatchIndexInFile(absolute_index);

    MatchesUI_refreshItemsForPath(scrollable_list, item);
}

void MatchesUI_listMatches(ParsedOpts * parsed_opts, MatchItem * all_matched_item)
{
    if (all_matched_item == NULL)
    {
        return;
    }

    g_search_pattern = parsed_opts->searchPattern;
    g_search_replacement = parsed_opts->searchReplacement;
    g_should_be_case_insensitive = parsed_opts->should_be_case_insensitive;

    g_all_matched_items = all_matched_item;

    initscr();

    ScrollableListItem * matches_scrollable_list_items = MatchesUI_getAllMatchesListItems();

    long total_width = COLS - 1;
    long total_height = LINES;

#define MAIN_LISTS_DIFF_WIDTH 20
    long header_height = 7;
    long matches_list_width = total_width / 2 - MAIN_LISTS_DIFF_WIDTH;
    long preview_list_witdh = matches_list_width + MAIN_LISTS_DIFF_WIDTH * 2;
    long list_height = total_height - header_height - 1;

    WINDOW * matches_window = newwin(list_height, matches_list_width, total_height - list_height, 1);
    WINDOW * preview_window = newwin(list_height, preview_list_witdh, total_height - list_height, matches_list_width + 1);

    struct ScrollableListCreateOpts matches_list_opts =
    {
        .all_items = matches_scrollable_list_items,
        .list_height = list_height,
        .list_width = matches_list_width,
        .selection_mode = ScrollableList_SelectionMode_FullLine,
        .should_center_text = false,
        .should_display_line_numbers = false,
        .window = matches_window,
    };
    ScrollableList matches_list =
        ScrollableList_create(matches_list_opts);

    struct ScrollableListCreateOpts preview_list_opts =
    {
        .all_items = NULL,
        .list_height = list_height,
        .list_width = preview_list_witdh,
        .selection_mode = ScrollableList_SelectionMode_LineFragment,
        .should_center_text = false,
        .should_display_line_numbers = true,
        .window = preview_window,
    };
    ScrollableList preview_list =
        ScrollableList_create(preview_list_opts);

    ScrollableListItem * header_list_items = MatchesUI_getHeaderItems(0, parsed_opts);
    WINDOW * header_window = newwin(header_height, total_width, 1, 1);

    struct ScrollableListCreateOpts header_list_opts =
    {
        .all_items = header_list_items,
        .list_height = header_height,
        .list_width = total_width,
        .selection_mode = ScrollableList_SelectionMode_NoSelection,
        .should_center_text = true,
        .should_display_line_numbers = false,
        .window = header_window,
    };
    ScrollableList header_list =
        ScrollableList_create(header_list_opts);

    g_preview_list = &preview_list;
    g_header_list = &header_list;

    matches_list.onEnter = &MatchesUI_handleMatchesListEnter;
    matches_list.onKey_r_Pressed = &MatchesUI_handleKey_r_Pressed;
    matches_list.onMove = &MatchesUI_handleMatchesListMove;

    MatchesUI_updatePreviewList(0);

    ScrollableList_waitForKey(&matches_list);

    delwin(matches_window);
    delwin(preview_window);

    endwin();

    ScrollableList_destroyWithItems(g_header_list);
    ScrollableList_destroyWithItems(g_preview_list);
    ScrollableList_destroyWithItems(&matches_list);
}
