import { AccountList } from "./model/account-list";
import { PostingAccount } from "./model/posting-account";
import { Post } from "./model/post";
import { View } from "./view";
import { Persistence } from "./persistence";
import { Dialog } from "./dialog";

export class Controller {

    view: View;

    constructor(public accountList: AccountList) {
        this.view = new View(this);
        this.repaintView();

        let undoButton = document.querySelector("#global-actions .undo"); 
        undoButton.addEventListener("click", _ => this.undo());
        let redoButton = document.querySelector("#global-actions .redo"); 
        redoButton.addEventListener("click", _ => this.redo());
        //TODO: implement
        // let editPostListsButton = document.querySelector("#global-actions .edit");

        //TODO: implement
        let editAccountButton = document.querySelector("#account-actions .edit"); 
        editAccountButton!.addEventListener("click", _ => this.editCurrentAccount());
        let addAccountButton = document.querySelector("#account-actions .add"); 
        addAccountButton!.addEventListener("click", _ => this.addAccount());
        //TODO: implement
        let removeAccountButton = document.querySelector("#account-actions .remove"); 
        removeAccountButton!.addEventListener("click", _ => this.removeCurrentAccount());

        let addPostButton = document.querySelector("#post-actions .add"); 
        addPostButton!.addEventListener("click", _ => this.addPost());
        let removePostButton = document.querySelector("#post-actions .remove"); 
        removePostButton!.addEventListener("click", _ => this.filterPost());
        let editPostButton = document.querySelector("#post-actions .edit");
        editPostButton!.addEventListener("click", _ => this.editPost());

        let acceptPostButton = document.querySelector("#post-text-actions .accept");
        acceptPostButton!.addEventListener("click", _ => this.acceptPost());
        let declinePostButton = document.querySelector("#post-text-actions .decline");
        declinePostButton!.addEventListener("click", _ => this.declinePost());
        let deferPostButton = document.querySelector("#post-text-actions .defer");
        deferPostButton!.addEventListener("click", _ => this.deferPost());
        let editPostTextButton = document.querySelector("#post-text-actions .edit");
        editPostTextButton!.addEventListener("click", _ => this.editPostText());
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
        // if(!this.accountList.currentAccount) return;
        // let userInput = prompt("Bitte neuen Accountnamen eingeben");
        // if(!userInput) return;
        // this.accountList.currentAccount.setTitle(userInput);
        // this.repaintAndSave();
    }
    
    removeCurrentAccount() {
        // if(!this.accountList.currentAccount) return;
        // if(!confirm("Wollen Sie den Account "+this.accountList.currentAccount.title+" wirklich löschen?")) return;
        // this.accountList.removeAccount(this.accountList.currentAccount);
        // this.accountList.currentAccount = null;
        // this.setCurrentPost(null)
        // this.repaintAndSave();
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