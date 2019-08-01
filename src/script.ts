import { PostList } from "./model/post-list";
import { Post } from "./model/post";
import { PostingAccount } from "./model/posting-account";
import { AccountList } from "./model/account-list";
import { View } from "./view";
import { Persistence } from "./persistence";

let postList = new PostList().init();
let post;
postList.addPost(new Post().init("Post 1", "URL1", "Post Text 1"));
postList.addPost(post = new Post().init("Post 2", "URL2", "Post Text 2"));
postList.addPost(new Post().init("Post 3", "URL3", "Post Text 3"));
postList.addPost(new Post().init("Post 4", "URL4", "Post Text 4"));
postList.removePost(post);

let accountList = new AccountList([
    new PostingAccount().init("Angi", postList),
    new PostingAccount().init("Josef", postList, new Set([postList.posts[0], postList.posts[1]])),
    new PostingAccount().init("Robin", postList, new Set([postList.posts[2], postList.posts[3]]))
]);

let view = new View();
let controller = view.controller;
controller.load();

controller.save();
controller.undo();