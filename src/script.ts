import { PostList } from "./model/post-list";
import { Post } from "./model/post";
import { PostingAccount } from "./model/posting-account";
import { AccountList } from "./model/account-list";
import { View } from "./view";
import { Persistence } from "./persistence";
import { Controller } from "./controller";
import { Dialog } from "./dialog";

let postList = new PostList().init("Post List 1");
for (let i = 0; i < 10; i++) {
    postList.addPost(new Post().init("Post "+i, "https://www.google.com/search?q="+i, "Post Text "+i));
}
postList.addPost(new Post().init("0_1_2_3_4_5_6_7_8_9_10_11_12_13_14_15_16_17_18_19_20_0_1_2_3_4_5_6_7_8_9_10_11_12_13_14_15_16_17_18_19_20_0_1_2_3_4_5_6_7_8_9_10_11_12_13_14_15_16_17_18_19_20","","Ridiculosly long title"))

let accountList = new AccountList([
    new PostingAccount().init("Angi", postList),
    new PostingAccount().init("Josef", postList, new Set([postList.posts[0], postList.posts[1]])),
    new PostingAccount().init("Robin", postList, new Set([postList.posts[2], postList.posts[3]]))
], [
    postList
]);

let controller = new Controller(accountList);
// controller.load();

let dialog = new Dialog();
dialog.createOverlay();