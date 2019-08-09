import { PostList } from "./model/post-list";
import { Post } from "./model/post";
import { AccountList } from "./model/account-list";
import { Controller } from "./controller";
import { readFileSync } from "fs";
import { Persistence } from "./persistence";

/**
 * Loads the default posts from a file and puts them into a post list.
 * Then creates an empty account list.
 * @param path the path of the posts file (JSON object with property "posts", which is a list of "title" and "url")
 */
function loadPosts(path = './data/posts.json'): AccountList {
    const { posts: parsed }: { posts: { title: string; url: string }[] } 
        = JSON.parse(readFileSync(path, 'utf-8'));
    const posts = parsed.map((parsedPost, index): Post => 
        new Post(parsedPost.title, parsedPost.url, undefined, index)
    );
    Post.runningId = posts.length;
    
    const postList = new PostList("Posts");
    postList.posts = posts;
    return new AccountList([], [postList]);
}

/*
 * Create a controller from the latest snapshot.
 * If no snapshot is found, load the default posts.
 */
try {
    new Controller(Persistence.load());
} catch(error) {
    if(error instanceof Error && error.message == "No snapshot found") {
        new Controller(loadPosts());
    } else {
        console.error(error);
    }
}
