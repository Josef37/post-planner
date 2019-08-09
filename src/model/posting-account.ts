import { Post } from './post';
import { PostList } from './post-list';

export class PostingAccount {

    // This is used for creating PostingAccount ids
    public static runningId: number = 0;

    public id: number;
    public currentPost: Post | undefined;
    public title: string;
    public postList: PostList|undefined;
    public filteredPosts: Set<Post>;

    /**
     * A PostingAccount controls preferences for one person
     * @param title The name of the account
     * @param postList The post list the account uses
     * @param filteredPosts The posts which the account excludes for posting
     * @param id An id you may only provide when recreating the account
     */
    public constructor(title: string, postList: PostList|undefined, filteredPosts: Set<Post> = new Set(), id?: number) {
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
     * Get all posts for posting (sorted), if there is a post list associated
     * @returns the posts which can be posted
     */
    public getPostsFiltered(): Post[] | undefined {
        if(this.postList) 
            return this.postList.posts.filter((post): boolean => !this.filteredPosts.has(post));
    }

}