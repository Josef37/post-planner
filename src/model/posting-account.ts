import { Post } from './post';
import { PostList } from './post-list';

export class PostingAccount {

    // This is used for creating PostingAccount ids
    public static runningId: number = 0;

    public id: number;
    public currentPost: Post | null = null;
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
     * @param post the post filter
     */
    public filterPost(post: Post): void {
        this.filteredPosts.add(post);
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

}