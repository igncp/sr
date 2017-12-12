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

void ScrollableListItem_destroyItems(ScrollableListItem*);

typedef struct ScrollableList {
  ScrollableListItem * all_items;
  ScrollableListItem * displayed_items;
  int selected_line_index;
  int first_displayed_item_index;
  WINDOW * window;

  void (*onEnter)(struct ScrollableList*, int selected_index);
  void (*onMove)(struct ScrollableList*, int moved_positions, int new_selected_index);
} ScrollableList;

ScrollableList ScrollableList_create(ScrollableListItem*, WINDOW*);

void ScrollableList_destroyWithItems(ScrollableList*);
void ScrollableList_removeItem(ScrollableList*, int item_index);
void ScrollableList_waitForKey(ScrollableList*);

#endif
