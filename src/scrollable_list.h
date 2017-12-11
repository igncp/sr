#ifndef SCROLLABLE_LIST_H

#define SCROLLABLE_LIST_H

#include <curses.h>

typedef struct ScrollableListItem {
  char * text;
  struct ScrollableListItem * next;
} ScrollableListItem;

ScrollableListItem * ScrollableListItem_getLast(ScrollableListItem*);
ScrollableListItem * ScrollableListItem_getDisplayedItemsFromAll(ScrollableListItem*);

typedef struct ScrollableList {
  ScrollableListItem * all_items;
  ScrollableListItem * displayed_items;
  WINDOW * window;

  void (*onEnter)(int selected_index);
  void (*onMove)(int moved_positions, int new_selected_index);
} ScrollableList;

ScrollableList ScrollableList_create(ScrollableListItem*, WINDOW*);

void ScrollableList_destroyWithItems(ScrollableList*);
void ScrollableList_removeItem(ScrollableList*, int item_index);

#endif
