import { AccountList } from "./model/account-list";
import { PostingAccount } from "./model/posting-account";
import { Post } from "./model/post";
import { View } from "./view";
import { Persistence } from "./persistence";
import { Dialog } from "./dialog";
import { PostList } from "./model/post-list";

export class Controller {

    view: View;

    constructor(public accountList: AccountList) {
        this.view = new View(this);
        this.repaintView();

        let undoButton = document.querySelector("#global-actions .undo"); 
        undoButton.addEventListener("click", () => this.undo());
        let redoButton = document.querySelector("#global-actions .redo"); 
        redoButton.addEventListener("click", () => this.redo());
        let editPostListsButton = document.querySelector("#global-actions .edit");
        editPostListsButton!.addEventListener("click", () => this.editPostLists());

        let editAccountButton = document.querySelector("#account-actions .edit"); 
        editAccountButton!.addEventListener("click", () => this.editCurrentAccount());
        let addAccountButton = document.querySelector("#account-actions .add"); 
        addAccountButton!.addEventListener("click", () => this.addAccount());
        let removeAccountButton = document.querySelector("#account-actions .remove"); 
        removeAccountButton!.addEventListener("click", () => this.removeCurrentAccount());

        let addPostButton = document.querySelector("#post-actions .add"); 
        addPostButton!.addEventListener("click", () => this.addPost());
        let removePostButton = document.querySelector("#post-actions .remove"); 
        removePostButton!.addEventListener("click", () => this.filterPost());
        let editPostButton = document.querySelector("#post-actions .edit");
        editPostButton!.addEventListener("click", () => this.editPost());

        let acceptPostButton = document.querySelector("#post-text-actions .accept");
        acceptPostButton!.addEventListener("click", () => this.acceptPost());
        let declinePostButton = document.querySelector("#post-text-actions .decline");
        declinePostButton!.addEventListener("click", () => this.declinePost());
        let deferPostButton = document.querySelector("#post-text-actions .defer");
        deferPostButton!.addEventListener("click", () => this.deferPost());
        let editPostTextButton = document.querySelector("#post-text-actions .edit");
        editPostTextButton!.addEventListener("click", () => this.editPostText());
    }

    addAccount() {
        Dialog.addAccount(this.accountList.postLists, (title, postListId, postIds) => {
            let newAccount = new PostingAccount().init(
                title, 
                this.accountList.getPostListById(postListId),
                new Set(postIds.map(postId => this.accountList.getPostById(postId)))
            );
            this.accountList.addAccount(newAccount);
            this.accountList.currentAccount = newAccount;
            this.repaintAndSave();
        });
    }
    
    editCurrentAccount() {
        let account = this.getCurrentAccount();
        if(!account) return;
        Dialog.editAccount(
            account.title, 
            account.postList.id, 
            Array.from(account.filteredPosts).map(post => post.id).sort(), 
            this.accountList.postLists,
            (title, postListId, postIds) => {
                account.title = title;
                account.postList = this.accountList.getPostListById(postListId);
                account.filteredPosts = new Set(postIds.map(postId => this.accountList.getPostById(postId)));
                this.repaintAndSave();
            }
        );
    }
    
    removeCurrentAccount() {
        let account = this.accountList.getCurrentAccount();
        if(!account) return;
        Dialog.confirm(`Willst du wirklich den Account ${account.title} löschen?`, () => { 
            this.accountList.removeAccount(account);
            this.accountList.setCurrentAccount(null);
            this.repaintAndSave();
        });
    }

    editPostLists() {
        let postLists = this.accountList.postLists;
        Dialog.editPostLists(
            postLists, 
            postLists.map(list => !!this.accountList.accounts.find(account => account.postList == list)), 
            titles => {
                for(let i=0; i<titles.length; i++) {
                    let title = titles[i];
                    if(i >= postLists.length) postLists.push(new PostList().init(title));
                    else if(title == '') delete postLists[i];
                }
                this.accountList.postLists = postLists.filter(list => list);
        });
    }

    addPost() {
        Dialog.addPost((title, url) => {
            this.accountList.addPost(title, url);
            this.repaintAndSave();
        });
    }

    // filters current post for current account
    filterPost() {
        if(!this.getCurrentAccount() || !this.getCurrentPost()) return;
        this.getCurrentAccount().filterPost(this.getCurrentPost());
        this.getCurrentAccount().setCurrentPost(null);
        this.repaintAndSave();
    }

    editPost() {
        let post = this.getCurrentPost();
        if(!post) return;
        Dialog.editPost(post.title, post.url, (title, url) => {
            post.title = title;
            post.url = url;
            this.repaintAndSave();
        });
    }
    
    acceptPost() {
        if(!this.getCurrentPost() || !this.accountList.currentAccount) return;
        this.accountList.currentAccount.postList.putPostLast(this.getCurrentPost()!);
        navigator.clipboard.writeText(this.getCurrentPost()!.getTextForPosting());
        this.repaintAndSave();
    }
    
    declinePost() {
        if(!this.accountList.currentAccount || !this.getCurrentPost()) return;
        this.accountList.currentAccount.postList.putPostLast(this.getCurrentPost()!);
        this.repaintAndSave();
    }
    
    deferPost() {
        if(!this.accountList.currentAccount || !this.getCurrentPost()) return;
        this.accountList.currentAccount.postList.deferPost(this.getCurrentPost()!);
        this.repaintAndSave();
    }

    editPostText() {
        if(!this.getCurrentPost()) return;
        Dialog.editPostText(this.getCurrentPost().text, newText => {
            this.getCurrentPost().text = newText;
            this.repaintAndSave();
        });
    }

    getAccountById(accountId: number): PostingAccount {
        return this.accountList.getAccountById(accountId);
    }

    repaintView() {
        this.view.displayAccountList(this.accountList.accounts);
        if(this.accountList.currentAccount) {
            this.view.displayPostList(this.accountList.currentAccount.getPostsFiltered());
        } else {
            this.view.displayPostList([]);
        }
        if(this.getCurrentPost()) {
            this.view.displayPostText(this.getCurrentPost()!);
        } else {
            this.view.clearPostText();
        }
    }

    load() {
        this.accountList = Persistence.load();
        this.repaintView();
    }

    save() {
        new Persistence(this.accountList).save();
    }

    undo() {
        this.accountList = Persistence.undo();
        this.repaintView();
    }

    redo() {
        this.accountList = Persistence.redo();
        this.repaintView();
    }

    repaintAndSave() {
        this.repaintView();
        this.save();
    }

    setAccountList(accountList: AccountList) { 
        this.accountList = accountList;
        this.repaintAndSave();
    }
    
    getCurrentAccount() { 
        return this.accountList.currentAccount; 
    }
    
    setCurrentAccount(account: PostingAccount | null) { 
        this.accountList.setCurrentAccount(account);
        this.repaintView();
    }
    
    getCurrentPost() { 
        if(!this.accountList.getCurrentAccount()) return null;
        return this.accountList.getCurrentAccount()!.getCurrentPost();
    }
    
    setCurrentPost(post: Post | null) { 
        if(!this.accountList.getCurrentAccount()) return;
        this.accountList.getCurrentAccount()!.setCurrentPost(post);
        this.repaintView();
    }
    
    getPostById(postId: number) {
        return this.accountList.getPostById(postId);
    }
}