#include "test_match_item.h"

#include <check.h>
#include <stdlib.h>

#include "test_test_helpers.h"

#include "../src/core/match_item.h"

START_TEST (test_get_n_items)
{
    MatchItem f1;
    MatchItem f2;
    MatchItem f3;
    MatchItem f4;

    f1.next = &f2;
    f1.index = 0;

    f2.next = &f3;
    f2.index = 1;

    f3.next = &f4;
    f3.index = 2;

    f4.next = NULL;
    f4.index = 3;

    MatchItem * f5 = MatchItem_getNItems(&f1, 3);

    ck_assert_int_eq(f5->index, 0);
    ck_assert_int_eq(f5->next->index, 1);
    ck_assert_int_eq(f5->next->next->index, 2);

    ck_assert_ptr_null(f5->next->next->next);
}
END_TEST

START_TEST (test_copy_single)
{
    MatchItem f1;
    MatchItem f2;

    f1.next = &f2;
    f1.index = 0;
    f1.path = "path1_value";

    f2.next = NULL;
    f2.index = 1;
    f2.path = "path2_value";

    MatchItem * f3 = MatchItem_copySingle(&f1);

    ck_assert_int_eq(f3->index, 0);
    ck_assert_str_eq(f3->path, "path1_value");
    ck_assert_ptr_null(f3->next);
    ck_assert_ptr_ne(f3, &f1);
}
END_TEST

START_TEST (test_get_item_n)
{
    MatchItem f1;
    MatchItem f2;
    MatchItem f3;

    f1.next = &f2;
    f1.index = 0;
    f1.path = "path1_value";

    f2.next = &f3;
    f2.index = 1;
    f2.path = "path2_value";

    f3.next = NULL;
    f3.index = 2;
    f3.path = "path3_value";

    MatchItem * f4 = MatchItem_getItemN(&f1, 1);

    ck_assert_ptr_eq(f4, &f2);
}
END_TEST

Suite * test_MatchItem_suite(void)
{
    Suite *s;
    TCase *tc_core;

    s = suite_create("MatchItem");

    tc_core = tcase_create("Core");

    tcase_add_test(tc_core, test_get_n_items);
    tcase_add_test(tc_core, test_copy_single);
    tcase_add_test(tc_core, test_get_item_n);

    suite_add_tcase(s, tc_core);

    return s;
}

int test_MatchItem_getFailed()
{
    TEST_HELPERS_GET_FAILED(test_MatchItem_suite);
}
