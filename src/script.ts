import { PostList } from "./model/post-list";
import { Post } from "./model/post";
import { PostingAccount } from "./model/posting-account";
import { AccountList } from "./model/account-list";
import { View } from "./view";
import { Persistence } from "./persistence";

let postList = new PostList().init();
for (let i = 0; i < 10; i++) {
    postList.addPost(new Post().init("Post "+i, "URL"+i, "Post Text "+i));
}
postList.addPost(new Post().init("1111111111111111111111111111111111111111111111111111111111111111111111","",""))

let accountList = new AccountList([
    new PostingAccount().init("Angi", postList),
    new PostingAccount().init("Josef", postList, new Set([postList.posts[0], postList.posts[1]])),
    new PostingAccount().init("Robin", postList, new Set([postList.posts[2], postList.posts[3]]))
]);

let view = new View();
let controller = view.controller;
controller.setAccountList(accountList);
// controller.load();