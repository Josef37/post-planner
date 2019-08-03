import { PostingAccount } from "./posting-account";
import { PostList } from "./post-list";
import { Post } from "./post";

export class AccountList {

    currentAccount: PostingAccount | null = null;
    
    constructor(public accounts: PostingAccount[],
                public postLists: PostList[]) {}

    addAccount(account: PostingAccount) {
        this.accounts.push(account);
    }

    removeAccount(account: PostingAccount) {
        let index = this.accounts.indexOf(account);
        if(index >= 0) this.accounts.splice(index, 1);
    }

    getAccounts() { return this.accounts; }

    getCurrentAccount() { 
        return this.currentAccount; 
    }
    
    setCurrentAccount(account: PostingAccount | null) { 
        this.currentAccount = account;
    }

    addPostList(postList: PostList) {
        this.postLists.push(postList);
    }

    removePostList(postList: PostList) {
        if(this.accounts.some(account => account.postList == postList))
            throw "Post list is still in use";
        let index = this.postLists.indexOf(postList);
        if(index >= 0) this.postLists.splice(index, 1);
    }

    addPost(title: string, url: string) {
        let post = new Post().init(title, url);
        this.postLists.forEach(list => list.addPost(post));
    }

    getAccountById(accountId: number): PostingAccount {
        let filtered = this.accounts.filter(account => account.id === accountId);
        if(filtered.length === 1) return filtered[0];
        throw "Account not found or ambigous";
    }
}