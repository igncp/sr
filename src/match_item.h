#ifndef MATCH_ITEM_H
#define MATCH_ITEM_H

typedef struct MatchItem
{
    char * path;
    struct MatchItem * next;
    size_t index;
    size_t total;
} MatchItem;

int MatchItem_countList(MatchItem * initial_node);
void MatchItem_copyDataToFrom(MatchItem * dest, MatchItem * src);

MatchItem * MatchItem_getItemN(MatchItem * initial_node, int n);
MatchItem * MatchItem_getLast(MatchItem * initial_node);
MatchItem * MatchItem_getNItems(MatchItem * item, int n);
MatchItem * MatchItem_copySingle(MatchItem * item);
MatchItem * MatchItem_moveFirstToEnd(MatchItem * item);

#endif
