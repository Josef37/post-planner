import { PostingAccount } from './posting-account';
import { PostList } from './post-list';
import { Post } from './post';

export class AccountList {

    public currentAccount: PostingAccount | null = null;
    public accounts: PostingAccount[];
    public postLists: PostList[];
    
    /**
     * AccountList lists all accounts and post lists, it is the central point of the model
     * @param accounts All PostingAccounts
     * @param postLists All PostLists
     */
    public constructor(accounts: PostingAccount[], postLists: PostList[]) {
        this.accounts = accounts;
        this.postLists = postLists;
    }

    /**
     * Adds an account to the list
     * @param account the account to be added
     */
    public addAccount(account: PostingAccount): void {
        this.accounts.push(account);
    }

    /**
     * Removes an account from the list, if it is found
     * @param account the account to be removed
     */
    public removeAccount(account: PostingAccount): void {
        const index = this.accounts.indexOf(account);
        if(index >= 0) this.accounts.splice(index, 1);
    }

    /**
     * Adds a post list to the list
     * @param postList the post list to be added
     */
    public addPostList(postList: PostList): void {
        this.postLists.push(postList);
    }

    /**
     * Removes a post list if it is unused
     * @param postList the post list to be removed
     * @throws an error if the post list is still in use
     */
    public removePostList(postList: PostList): void {
        if(this.accounts.some((account): boolean => account.postList == postList))
            throw new Error('Post list is still in use');
        const index = this.postLists.indexOf(postList);
        if(index >= 0) this.postLists.splice(index, 1);
    }

    /**
     * Adds a post to all post lists
     * @param post the post to be added
     */
    public addPost(post: Post): void {
        this.postLists.forEach((list): void => list.addPost(post));
    }

    /**
     * Removes a post from all post lists, filters and as current post
     * @param post the post to be removed
     */
    public removePost(post: Post): void {
        this.postLists.forEach((list): boolean => list.removePost(post));
        this.accounts.forEach((account): void => {
            if(account.currentPost == post) account.currentPost = null;
            account.unfilterPost(post);
        });
    }

    /**
     * Gets the account with the given id, if it is found
     */
    public getAccountById(accountId: number): PostingAccount | null {
        return this.accounts.find((account): boolean => account.id === accountId) || null;
    }

    /**
     * Gets the post list with the given id, if it is found
     */
    public getPostListById(postListId: number): PostList | null {
        return this.postLists.find((list): boolean => list.id === postListId) || null;
    }
    
    /**
     * Gets the post with the given id, if it is found
     */
    public getPostById(postId: number): Post | null   {
        let post: Post | undefined;
        for(const list of this.postLists) {
            post = list.getPostById(postId);
            if(post) break;
        }
        return post || null;
    }
}