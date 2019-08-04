import { PostList } from "./model/post-list";
import { Post } from "./model/post";
import { AccountList } from "./model/account-list";
import { Controller } from "./controller";
import { readFileSync } from "fs";
import { Persistence } from "./persistence";

function loadPosts(path = './data/posts.json'): AccountList {
    const { posts: parsed }: { posts: { title: string; url: string }[] } 
        = JSON.parse(readFileSync(path, 'utf-8'));
    const posts = parsed.map((parsedPost, index): Post => {
        const newPost = new Post();
        [newPost.id, newPost.title, newPost.url] = [index, parsedPost.title, parsedPost.url];
        return newPost;
    });
    Post.runningId = posts.length;
    
    const postList = new PostList().init("Posts");
    postList.posts = posts;
    return new AccountList([], [postList]);
}

try {
    new Controller(Persistence.load());
} catch(error) {
    if(error == "No snapshot found") {
        new Controller(loadPosts());
    } else {
        console.error(error);
    }
}
