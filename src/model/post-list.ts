import { Post } from "./post";

export class PostList {
    
    public static runningId: number = 0;

    public id: number = -1;
    public title: string = "";
    public posts: Post[] = [];

    public constructor() {}

    public init(title: string, posts: Post[] = []): PostList {
        this.id = PostList.runningId++;
        this.title = title;
        this.posts = posts;
        return this;
    }

    public static fromJSON({id, title, posts}: {id: number; title: string; posts: Post[]}): PostList {
        const postList = new PostList();
        postList.id = id;
        postList.title = title;
        postList.posts = posts;
        return postList;
    }

    public addPost(post: Post): void {
        this.posts.push(post);
    }

    // remove post and retrun if successful
    public removePost(post: Post): boolean {
        const index = this.posts.indexOf(post);
        if(index === -1) return false;
        this.posts.splice(index, 1);
        return true;
    }

    public putPostLast(post: Post): boolean {
        if(this.removePost(post)) { 
            this.addPost(post);
            return true;
        }
        return false;
    }

    public deferPost(post: Post, positions = 10): boolean {
        const index = this.posts.indexOf(post);
        if(index === -1) return false;
        this.posts.splice(index+positions, 0, this.posts.splice(index, 1)[0]);
        return true;
    }

    public getPostById(postId: number): Post|undefined {
        return this.posts.find((post): boolean => post.id === postId);
    }

}