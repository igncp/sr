#include <curses.h>
#include <stdlib.h>

#include "match_item.h"

#define KEY_ENTER_FIXED 10

struct MatchesListScreen
{
    MatchItem * screen_item;

    int first_displayed_match_index;
    int line_focused_index;
    int screen_items_count;
};

struct LoopOpts
{
    struct MatchesListScreen * matches_screen;
    MatchItem * all_matched_item;
    WINDOW * window;
};

void moveScreenItems(
    MatchItem * all_matched_item,
    struct MatchesListScreen * matches_screen,
    int movement
)
{
    int all_matched_items_count = MatchItem_countList(all_matched_item);
    int screen_matched_item_count = matches_screen->screen_items_count;

    if (movement == 1)
    {
        if (
            screen_matched_item_count + matches_screen->first_displayed_match_index <
            all_matched_items_count
        )
        {
            MatchItem * next_item =
                MatchItem_getItemN(
                    all_matched_item,
                    screen_matched_item_count +
                    matches_screen->first_displayed_match_index
                );
            MatchItem * last_item =
                MatchItem_getItemN(
                    matches_screen->screen_item,
                    screen_matched_item_count - 1
                );

            last_item->next = MatchItem_copySingle(next_item);

            MatchItem * item_to_remove = matches_screen->screen_item;

            matches_screen->screen_item = matches_screen->screen_item->next;

            free(item_to_remove);
        }
    }
    else if(movement == -1)
    {
        MatchItem * prev_item = MatchItem_getItemN(
            all_matched_item,
            matches_screen->first_displayed_match_index - 1
        );
        MatchItem * prev_to_last_item = MatchItem_getItemN(
            matches_screen->screen_item,
            screen_matched_item_count - 2
        );

        free(prev_to_last_item->next);
        prev_to_last_item->next = NULL;

        MatchItem * prev_item_copy = MatchItem_copySingle(prev_item);
        prev_item_copy->next = matches_screen->screen_item;

        matches_screen->screen_item = prev_item_copy;
    }
}

void paintMatchRow(MatchItem * node, int line_idx, struct LoopOpts * opts)
{
    char item[1024];

    sprintf(
        item,
        "%ld / %ld - %s",
        node->index + 1,
        node->total,
        node->path
    );
    mvwprintw(opts->window, line_idx+1, 2, "%s", item );
}

void updateScreenItems(struct LoopOpts * opts)
{
    MatchItem * node = opts->matches_screen->screen_item;
    int i = 0;
    char item[1024];

    i = 0;
    while (true)
    {
        if (i == LINES - 3)
        {
            break;
        }

        sprintf(item, "%*s", COLS - 4, "");
        mvwprintw(opts->window, i+1, 2, "%s", item);
        i++;
    }

    i = 0;
    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        paintMatchRow(node, i, opts);

        node = node->next;
        i++;
    }

    wrefresh( opts->window ); // update the terminal screen
}

void tryMovingSelectedLine(
    MatchItem * all_matched_item,
    struct MatchesListScreen * matches_screen,
    int movement_positions
)
{
    int all_matched_items_count = MatchItem_countList(all_matched_item);
    int screen_matched_item_count = matches_screen->screen_items_count;

    if (all_matched_items_count == screen_matched_item_count)
    {
        matches_screen->line_focused_index += movement_positions;

        if (matches_screen->line_focused_index > matches_screen->screen_items_count - 1)
        {
            matches_screen->line_focused_index = matches_screen->screen_items_count - 1;
        }
        else if (matches_screen->line_focused_index < 0)
        {
            matches_screen->line_focused_index = 0;
        }
    }
    else if (all_matched_items_count > screen_matched_item_count)
    {

        int current_index = matches_screen->line_focused_index;
        int current_position = matches_screen->first_displayed_match_index;
        int max_first_displayed = all_matched_items_count - matches_screen->screen_items_count;

        bool is_inside_list = current_position + current_index + movement_positions <= all_matched_items_count &&
            current_position + current_index + movement_positions >= 0;

        matches_screen->line_focused_index += movement_positions;

        if (matches_screen->line_focused_index > matches_screen->screen_items_count - 1)
        {
            matches_screen->first_displayed_match_index += movement_positions;

            if (is_inside_list) {
                matches_screen->line_focused_index = current_index;
            } else {
                matches_screen->line_focused_index = matches_screen->screen_items_count - 1;
            }
        }
        else if (matches_screen->line_focused_index < 0)
        {
            matches_screen->first_displayed_match_index += movement_positions;

            if (is_inside_list) {
                matches_screen->line_focused_index = current_index;
            } else {
                matches_screen->line_focused_index = 0;
            }
        }

        int first_displayed_diff = matches_screen->first_displayed_match_index - max_first_displayed;

        if (first_displayed_diff > 0)
        {
            if (matches_screen->line_focused_index + first_displayed_diff < matches_screen->screen_items_count) {
                matches_screen->line_focused_index += first_displayed_diff;
            }
            matches_screen->first_displayed_match_index = max_first_displayed;
        } else if (matches_screen->first_displayed_match_index < 0) {
            if (matches_screen->line_focused_index + matches_screen->first_displayed_match_index >= 0) {
                matches_screen->line_focused_index += matches_screen->first_displayed_match_index;
            }
            matches_screen->first_displayed_match_index = 0;
        }

        MatchItem * first_item = MatchItem_getItemN(all_matched_item, matches_screen->first_displayed_match_index);
        matches_screen->screen_item = MatchItem_getNItems(first_item, matches_screen->screen_items_count);
    }
}

void waitForKey(struct LoopOpts * opts)
{
    struct MatchesListScreen * matches_screen = opts->matches_screen;

    int screen_matched_item_count = MatchItem_countList(
                                        matches_screen->screen_item
                                    );
    int all_matched_items_count = MatchItem_countList(opts->all_matched_item);

    int items_position = 0;

    int ch;
    while((ch = wgetch(opts->window)) != 'q')
    {
        // right pad with spaces to make the items appear with even width.
        paintMatchRow(
            MatchItem_getItemN(
                matches_screen->screen_item,
                matches_screen->line_focused_index
            ),
            matches_screen->line_focused_index,
            opts
        );

        // use a variable to increment or decrement the value based on the input.
        if (ch == KEY_UP)
        {
            tryMovingSelectedLine(
                opts->all_matched_item,
                matches_screen,
                -1
            );
            updateScreenItems(opts);
        }
        else if (ch == KEY_DOWN)
        {
            tryMovingSelectedLine(
                opts->all_matched_item,
                matches_screen,
                1
            );
            updateScreenItems(opts);
        }
        else if (ch == KEY_PPAGE)
        {
            tryMovingSelectedLine(
                opts->all_matched_item,
                matches_screen,
                screen_matched_item_count * -1
            );
            updateScreenItems(opts);
        }
        else if (ch == KEY_NPAGE)
        {
            tryMovingSelectedLine(
                opts->all_matched_item,
                matches_screen,
                screen_matched_item_count
            );
            updateScreenItems(opts);
        }
        else if (ch == KEY_ENTER_FIXED)
        {
            break;
        }

        wattron( opts->window, A_STANDOUT );

        paintMatchRow(
            MatchItem_getItemN(
                matches_screen->screen_item,
                matches_screen->line_focused_index
            ),
            matches_screen->line_focused_index,
            opts
        );

        wattroff( opts->window, A_STANDOUT );
    }
}

void UI_listMatches(MatchItem * all_matched_item)
{
    WINDOW *w;

    initscr(); // initialize Ncurses
    w = newwin( LINES - 1, COLS - 1, 1, 1 ); // create a new window
    box( w, 0, 0 ); // sets default borders for the window

    MatchItem * screen_matched_item = MatchItem_getNItems(all_matched_item, LINES - 3);

    struct MatchesListScreen matches_screen;

    matches_screen.screen_item = screen_matched_item;
    matches_screen.first_displayed_match_index = 0;
    matches_screen.line_focused_index = 0;
    matches_screen.screen_items_count = MatchItem_countList(matches_screen.screen_item);

    struct LoopOpts opts = {&matches_screen, all_matched_item, w};

    int i = 0;
    MatchItem * node = screen_matched_item;
    while (true)
    {
        if (node == NULL)
        {
            break;
        }

        if( i == 0 )
            wattron( w, A_STANDOUT );
        else
            wattroff( w, A_STANDOUT );

        paintMatchRow(node, i, &opts);

        node = node->next;
        i++;
    }

    wrefresh(w);

    keypad(w, TRUE);
    curs_set(0);

    noecho();

    waitForKey(&opts);

    delwin(w);
    endwin();
}
