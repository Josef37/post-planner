import { Post } from './post';
import { PostList } from './post-list';

export class PostingAccount {

    public static runningId: number = 0;

    public id: number = -1;
    public currentPost: Post | undefined = undefined;
    public title: string = "";
    public postList: PostList|undefined;
    public filteredPosts: Set<Post> = new Set();

    public constructor() {}

    public init(title: string, postList: PostList|undefined, filteredPosts: Set<Post> = new Set()): PostingAccount {
        this.id = PostingAccount.runningId++;
        [this.title, this.postList, this.filteredPosts] = [title, postList, filteredPosts];
        return this;
    }

    public static fromJSON({id, title, postList, filteredPosts}: 
    {id: number; title: string; postList: PostList|undefined; filteredPosts: Post[]}): PostingAccount {
        const account = new PostingAccount();
        account.id = id;
        account.title = title;
        account.postList = postList;
        account.filteredPosts = new Set(filteredPosts);
        return account;
    }

    public addPost(post: Post): void {
        this.postList && this.postList.addPost(post);
    }

    public removePost(post: Post): void {
        this.postList && this.postList.removePost(post);
    }

    public filterPost(post: Post): void {
        this.filteredPosts.add(post);
    }

    public unfilterPost(post: Post): void {
        this.filteredPosts.delete(post);
    }

    public getPostsFiltered(): Post[]|undefined {
        if(this.postList) 
            return this.postList.posts.filter((post): boolean => !this.filteredPosts.has(post));
    }

    public setTitle(title: string): void { 
        this.title = title; 
    }

    public getTitle(): string { 
        return this.title;
    }

    public getCurrentPost(): Post|undefined { 
        return this.currentPost; 
    }
    
    public setCurrentPost(post: Post | undefined): void { 
        this.currentPost = post;
    }

}