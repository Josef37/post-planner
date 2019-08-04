import { PostingAccount } from "./posting-account";
import { PostList } from "./post-list";
import { Post } from "./post";

export class AccountList {

    public currentAccount: PostingAccount | undefined;
    public accounts: PostingAccount[];
    public postLists: PostList[];
    
    public constructor(accounts: PostingAccount[], postLists: PostList[]) {
        this.accounts = accounts;
        this.postLists = postLists;
    }

    public addAccount(account: PostingAccount): void {
        this.accounts.push(account);
    }

    public removeAccount(account: PostingAccount): void {
        const index = this.accounts.indexOf(account);
        if(index >= 0) this.accounts.splice(index, 1);
    }

    public getAccounts(): PostingAccount[] { 
        return this.accounts;
    }

    public getCurrentAccount(): PostingAccount|undefined { 
        return this.currentAccount; 
    }
    
    public setCurrentAccount(account: PostingAccount | undefined): void { 
        this.currentAccount = account;
    }

    public addPostList(postList: PostList): void {
        this.postLists.push(postList);
    }

    public removePostList(postList: PostList): void {
        if(this.accounts.some((account): boolean => account.postList == postList))
            throw "Post list is still in use";
        const index = this.postLists.indexOf(postList);
        if(index >= 0) this.postLists.splice(index, 1);
    }

    public addPost(title: string, url: string): void {
        const post = new Post().init(title, url);
        this.postLists.forEach((list): void => list.addPost(post));
    }

    public getAccountById(accountId: number): PostingAccount|undefined {
        return this.accounts.find((account): boolean => account.id === accountId);
    }

    public getPostListById(postListId: number): PostList|undefined {
        return this.postLists.find((list): boolean => list.id === postListId);
    }
    
    public getPostById(postId: number): Post|undefined   {
        let post: Post|undefined;
        for(const list of this.postLists) {
            post = list.getPostById(postId);
            if(post) break;
        }
        return post;
    }
}