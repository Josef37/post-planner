import { AccountList } from "./model/account-list";
import { PostingAccount } from "./model/posting-account";
import { Post } from "./model/post";
import { View } from "./view";
import { Persistence } from "./persistence";

export class Controller {

    view: View;

    constructor(public accountList: AccountList) {
        this.view = new View(this);
        this.repaintView();

        let editAccountButton = document.querySelector("#accounts-section .action .edit");
        editAccountButton!.addEventListener("click", _ => this.editCurrentAccount());
        
        let addAccountButton = document.querySelector("#accounts-section .action .add");
        addAccountButton!.addEventListener("click", _ => this.addAccount());

        let removeAccountButton = document.querySelector("#accounts-section .action .remove");
        removeAccountButton!.addEventListener("click", _ => this.removeCurrentAccount());

        let addPostButton = document.querySelector("#posts-section .action .add");

        let removePostButton = document.querySelector("#posts-section .action .remove");

        let editPostButton = document.querySelector("#posts-section .action .edit");

        let acceptPostButton = document.querySelector("#post-text-section .action .accept");
        acceptPostButton!.addEventListener("click", _ => this.acceptPost());

        let declinePostButton = document.querySelector("#post-text-section .action .decline");
        declinePostButton!.addEventListener("click", _ => this.declinePost());

        let deferPostButton = document.querySelector("#post-text-section .action .defer");
        deferPostButton!.addEventListener("click", _ => this.deferPost());

        let editPostTextButton = document.querySelector("#post-text-section .action .edit");
    }

    addAccount() {
        if(!this.accountList.currentAccount) return;
        let userInput = prompt("Bitte Accountnamen eingeben");
        if(!userInput) return;
        //TODO change postList, remove "if(this.accountList.currentAccount)"
        let newAccount = new PostingAccount().init(userInput, this.accountList.currentAccount.postList);
        this.accountList.addAccount(newAccount);
        this.accountList.currentAccount = newAccount;
        this.setCurrentPost(this.accountList.currentAccount.getPostsFiltered()[0])
        this.repaintAndSave();
    }
    
    editCurrentAccount() {
        if(!this.accountList.currentAccount) return;
        let userInput = prompt("Bitte neuen Accountnamen eingeben");
        if(!userInput) return;
        this.accountList.currentAccount.setTitle(userInput);
        this.repaintAndSave();
    }
    
    removeCurrentAccount() {
        if(!this.accountList.currentAccount) return;
        if(!confirm("Wollen Sie den Account "+this.accountList.currentAccount.title+" wirklich löschen?")) return;
        this.accountList.removeAccount(this.accountList.currentAccount);
        this.accountList.currentAccount = null;
        this.setCurrentPost(null)
        this.repaintAndSave();
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

    getAccountById(accountId: number): PostingAccount {
        return this.accountList.getAccountById(accountId);
    }

    getPostById(postId: number): Post {
        if(!this.getCurrentAccount()) throw "No post list found";
        return this.getCurrentAccount()!.postList.getPostById(postId);
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

    repaintAndSave() {
        this.repaintView();
        this.save();
    }
    
    getAccountList() { 
        return this.accountList;
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
    
}