#include <curses.h>
#include <stdlib.h>

#include "match_item.h"

#define KEY_ENTER_FIXED 10

struct MatchesListScreen
{
    MatchItem * screen_item;

    int first_displayed_match_index;
    int line_focused_index;
    int sceen_items_count;
};

struct LoopOpts
{
    struct MatchesListScreen * matches_screen;
    MatchItem * all_matched_item;
    WINDOW * window;
};

// movement: 1 -> down, -1 up
void moveScreenItems(struct LoopOpts * opts, int pos, int movement)
{
    int all_matched_items_count = MatchItem_countList(opts->all_matched_item);
    struct MatchesListScreen * matches_screen = opts->matches_screen;
    int screen_matched_item_count = matches_screen->sceen_items_count;

    if (movement == 1)
    {
        if (screen_matched_item_count + pos < all_matched_items_count)
        {
            MatchItem * next_item =
                MatchItem_getItemN(
                    opts->all_matched_item,
                    screen_matched_item_count + pos
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
        MatchItem * prev_item =
            MatchItem_getItemN(opts->all_matched_item, pos - 1);
        MatchItem * prev_to_last_item =
            MatchItem_getItemN(
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

    sprintf(item, "%ld / %ld - %s", node->index + 1, node->total, node->path);
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
            matches_screen->line_focused_index -= 1;
            if (matches_screen->line_focused_index < 0)
            {
                matches_screen->line_focused_index = 0;
                if (items_position > 0)
                {
                    moveScreenItems(opts, items_position, -1);
                    items_position--;
                    updateScreenItems(opts);
                }
            }
        }
        else if (ch == KEY_DOWN)
        {
            matches_screen->line_focused_index += 1;

            if (matches_screen->line_focused_index > screen_matched_item_count - 1)
            {
                matches_screen->line_focused_index = screen_matched_item_count - 1;

                if (screen_matched_item_count < all_matched_items_count)
                {
                    moveScreenItems(opts, items_position, 1);
                    items_position++;
                    updateScreenItems(opts);
                }
            }
        }
        else if (ch == KEY_PPAGE)
        {
            if (screen_matched_item_count == all_matched_items_count)
            {
                matches_screen->line_focused_index = 0;
            }
        }
        else if (ch == KEY_NPAGE)
        {
            if (screen_matched_item_count == all_matched_items_count)
            {
                matches_screen->line_focused_index = screen_matched_item_count - 1;
            }
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
    matches_screen.sceen_items_count = MatchItem_countList(matches_screen.screen_item);

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
