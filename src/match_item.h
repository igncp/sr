#ifndef MATCH_ITEM_H
#define MATCH_ITEM_H

typedef struct MatchItem
{
    char * path;
    struct MatchItem * next;
    size_t index;
    size_t total;
} MatchItem;

int MatchItem_countList(MatchItem*);

void MatchItem_copyDataToFrom(MatchItem * dest, MatchItem * src);
void MatchItem_deleteList(MatchItem*);

MatchItem * MatchItem_getItemN(MatchItem*, int n);
MatchItem * MatchItem_getLast(MatchItem*);
MatchItem * MatchItem_getNItems(MatchItem*, int n);
MatchItem * MatchItem_copySingle(MatchItem*);
MatchItem * MatchItem_moveFirstToEnd(MatchItem*);

#endif
