let postList = new PostList();
postList.addPost(new Post("Post 1", "URL1", "Post Text 1"));
postList.addPost(new Post("Post 2", "URL2", "Post Text 2"));
postList.addPost(new Post("Post 3", "URL3", "Post Text 3"));
postList.addPost(new Post("Post 4", "URL4", "Post Text 4"));

let accountList = new AccountList([
    new PostingAccount("Angi", postList),
    new PostingAccount("Josef", postList, new Set([postList.posts[0], postList.posts[1]])),
    new PostingAccount("Robin", postList, new Set([postList.posts[2], postList.posts[3]]))
]);

let view = new View();
let controller = view.controller;
controller.setAccountList(accountList);


