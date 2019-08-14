import { Post } from './post';
import { PostList } from './post-list';

export class PostingAccount {

    // This is used for creating PostingAccount ids
    public static runningId: number = 0;

    public id: number;
    public currentPosts: Set<Post> = new Set();
    public title: string;
    public postList: PostList | null;
    public filteredPosts: Set<Post>;

    /**
     * A PostingAccount controls preferences for one person
     * @param title The name of the account
     * @param postList The post list the account uses
     * @param filteredPosts The posts which the account excludes for posting
     * @param id An id you may only provide when recreating the account
     */
    public constructor(title: string, postList: PostList | null, filteredPosts: Set<Post> = new Set(), id?: number) {
        [this.title, this.postList, this.filteredPosts] = [title, postList, filteredPosts];
        this.id = id === undefined ? PostingAccount.runningId++ : id;
    }

    /**
     * Excludes a post from posting for this account
     * @param post the post to filter
     */
    public filterPost(post: Post): void {
        this.filteredPosts.add(post);
    }

    /**
     * Excludes a set of posts from posting for this account
     * @param posts the posts to filter
     */
    public filterPosts(posts: Set<Post>): void {
        posts.forEach((post): void => this.filterPost(post));
    }

    /**
     * Removes a post from filtering (so it can be posted again)
     * @param post the post to remove from the filter
     * @returns if the operation was successful
     */
    public unfilterPost(post: Post): boolean {
        return this.filteredPosts.delete(post);
    }

    /**
     * Get all posts for posting (sorted), if there is a post list associated
     * @returns the posts which can be posted
     */
    public getPostsFiltered(): Post[] | null {
        return this.postList && this.postList.posts.filter((post): boolean => !this.filteredPosts.has(post));
    }

    /**
     * Selects the first post of the post list as current post.
     * Does nothing if there is no list or it is empty.
     */
    public selectFirstPost(): void {
        const posts = this.getPostsFiltered();
        if(posts && posts.length > 0) {
            this.currentPosts.clear();
            this.currentPosts.add(posts[0]);
        }
    }

    /**
     * Clears the current posts and sets the new one
     * @param post the post to be set as current or null, if there should be none
     */
    public setCurrentPost(post: Post | null): void {
        this.currentPosts.clear();
        post && this.currentPosts.add(post);
    }

}