#ifndef SCROLLABLE_LIST_H

#define SCROLLABLE_LIST_H

#include <curses.h>

typedef struct ScrollableListItem {
    char * text;
    struct ScrollableListItem * next;
} ScrollableListItem;

ScrollableListItem * ScrollableListItem_getLast(ScrollableListItem*);
ScrollableListItem * ScrollableListItem_getDisplayedItemsFromAll(ScrollableListItem*);
ScrollableListItem * ScrollableListItem_getItemN(ScrollableListItem*, int);
ScrollableListItem * ScrollableListItem_getNItems(ScrollableListItem*, int);
ScrollableListItem * ScrollableListItem_create(char * text);

int ScrollableListItem_getCount(ScrollableListItem*);
void ScrollableListItem_destroyItems(ScrollableListItem*);

enum ScrollableList_SelectionMode {
  ScrollableList_SelectionMode_FullLine,
  ScrollableList_SelectionMode_LineFragment,
  ScrollableList_SelectionMode_NoSelection,
};

typedef struct ScrollableList {
    ScrollableListItem * all_items;
    ScrollableListItem * displayed_items;

    int selected_line_index;
    int selection_mode;
    int selection_line_start_pos;
    int selection_line_end_pos;

    int first_displayed_item_index;
    int width;
    int height;

    bool should_center_text;

    WINDOW * window;

    void (*onEnter)(struct ScrollableList*, int selected_index);
    void (*onMove)(int absolute_selected_index);
} ScrollableList;

struct ScrollableListCreateOpts {
    ScrollableListItem * all_items;
    WINDOW * window;
    bool should_center_text;
    int list_height;
    int list_width;
    int selection_mode;
};

ScrollableList ScrollableList_create(struct ScrollableListCreateOpts);

void ScrollableList_destroyWithItems(ScrollableList*);
void ScrollableList_removeItem(ScrollableList*, int item_index);
void ScrollableList_waitForKey(ScrollableList*);
void ScrollableList_refreshAndPaintList(ScrollableList * scrollable_list);

#endif
