import { Post } from "./post";

export class PostList {
    
    static runningId: number = 0;

    id: number;
    title: string;
    posts: Post[] = [];

    constructor() {}

    init(title: string, posts: Post[] = []): PostList {
        this.id = PostList.runningId++;
        this.title = title;
        this.posts = posts;
        return this;
    }

    static fromJSON({id, title, posts}) {
        let postList = new PostList();
        postList.id = id;
        postList.title = title;
        postList.posts = posts;
        return postList;
    }

    addPost(post: Post): void {
        this.posts.push(post);
    }

    // remove post and retrun if successful
    removePost(post: Post): boolean {
        let index = this.posts.indexOf(post);
        if(index === -1) return false;
        this.posts.splice(index, 1);
        return true;
    }

    putPostLast(post: Post): boolean {
        if(this.removePost(post)) { 
            this.addPost(post);
            return true;
        }
        return false;
    }

    deferPost(post: Post, positions = 10) {
        let index = this.posts.indexOf(post);
        if(index === -1) return false;
        this.posts.splice(index+positions, 0, this.posts.splice(index, 1)[0]);
        return true;
    }

    getPostById(postId: number): Post {
        return this.posts.find(post => post.id === postId);
    }

}