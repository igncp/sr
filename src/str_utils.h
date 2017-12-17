#ifndef STR_UTILS_H
#define STR_UTILS_H

#include <string.h>

struct StrUtils_Line {
  char * text;
  struct StrUtils_Line * next;
};

struct StrUtils_Line * StrUtils_Line_splitStrInLines(char * str, int max_lines);
void StrUtils_Line_destroyList(struct StrUtils_Line*);
int StrUtils_getDigitsForNumber(int number);
char * StrUtils_createStrWithFragmentReplaced(char * orig_str, int pos_start, int chars, char * replacement);

// LinkedListType requirements: next and char * text
#define STR_UTILS_ADD_LINE_NUMBERS(LinkedListType, LinkedList_Ptr, IntCount) \
  do { \
    LinkedListType * fn_node = LinkedList_Ptr; \
    int total_digits = StrUtils_getDigitsForNumber(IntCount); \
    int counter = 1; \
    while (true) { \
        if (fn_node == NULL) { \
            break; \
        } \
        char * line_with_number = malloc(sizeof(char) * strlen(fn_node->text) + 30); \
        int digits_of_line = StrUtils_getDigitsForNumber(counter); \
        sprintf(line_with_number, "%d", counter); \
        for (int i = 0; i <= (total_digits - digits_of_line); i++) { \
            strcat(line_with_number, " "); \
        } \
        strcat(line_with_number, fn_node->text); \
        free(fn_node->text); \
        fn_node->text = line_with_number; \
        fn_node = fn_node->next; \
        counter++; \
    } \
  } while(0)

#endif
