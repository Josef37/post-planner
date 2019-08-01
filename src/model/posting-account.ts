import { Post } from './post';
import { PostList } from './post-list';

export class PostingAccount {

    //TODO: How?
    static runningId: number = 0;

    id: number;
    currentPost: Post | null = null;
    title: string;
    postList: PostList;
    filteredPosts: Set<Post>;

    constructor() {}

    init(title: string, postList: PostList, filteredPosts: Set<Post> = new Set()): PostingAccount {
        this.id = PostingAccount.runningId++;
        [this.title, this.postList, this.filteredPosts] = [title, postList, filteredPosts];
        return this;
    }

    static fromJSON({id, title, postList, filteredPosts}): PostingAccount {
        let account = new PostingAccount();
        account.id = id;
        account.title = title;
        account.postList = postList;
        account.filteredPosts = new Set(filteredPosts);
        return account;
    }

    addPost(post: Post) {
        this.postList.addPost(post);
    }

    removePost(post: Post) {
        return this.postList.removePost(post);
    }

    filterPost(post: Post) {
        this.filteredPosts.add(post);
    }

    unfilterPost(post: Post) {
        this.filteredPosts.delete(post);
    }

    getPostsFiltered(): Post[] {
        return this.postList.posts.filter(post => !this.filteredPosts.has(post));
    }

    setTitle(title: string) { this.title = title; }
    getTitle() { return this.title; }

    getCurrentPost() { 
        return this.currentPost; 
    }
    
    setCurrentPost(post: Post | null) { 
        this.currentPost = post;
    }

}