import { PostList } from "./model/post-list";
import { Post } from "./model/post";
import { PostingAccount } from "./model/posting-account";
import { AccountList } from "./model/account-list";
import { Controller } from "./controller";

const postList = new PostList().init("Post List 1");
for (let i = 0; i < 30; i++) {
    postList.addPost(new Post().init("Post " + i, "https://www.google.com/search?q=" + i, "Post Text " + i));
}
postList.addPost(new Post().init("0_1_2_3_4_5_6_7_8_9_10_11_12_13_14_15_16_17_18_19_20_0_1_2_3_4_5_6_7_8_9_10_11_12_13_14_15_16_17_18_19_20_0_1_2_3_4_5_6_7_8_9_10_11_12_13_14_15_16_17_18_19_20", "", "Ridiculosly long title"))

const accountList = new AccountList([
    new PostingAccount().init("Angi", postList),
    new PostingAccount().init("Josef", postList, new Set([postList.posts[0], postList.posts[1]])),
    new PostingAccount().init("Robin", postList, new Set([postList.posts[2], postList.posts[3]]))
], [
    postList,
    new PostList().init("Brandneu!")
]);

new Controller(accountList);
// controller.load();
// TODO: What happens with 2 controllers? Everything is query-selected
// new Controller(new AccountList([], []));
