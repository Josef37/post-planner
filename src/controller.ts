class Controller {

    accountList: AccountList = new AccountList([]);

    constructor(public view: View) {
        let editAccountButton = document.querySelector("#accounts-section .action .edit");
        editAccountButton!.addEventListener("click", _ => this.editCurrentAccount());
        
        let addAccountButton = document.querySelector("#accounts-section .action .add");
        addAccountButton!.addEventListener("click", _ => this.addAccount());

        let removeAccountButton = document.querySelector("#accounts-section .action .remove");
        removeAccountButton!.addEventListener("click", _ => this.removeCurrentAccount());

        let acceptPostButton = document.querySelector("#post-text-section .action .accept");
        acceptPostButton!.addEventListener("click", _ => this.acceptPost());

        let declinePostButton = document.querySelector("#post-text-section .action .decline");
        declinePostButton!.addEventListener("click", _ => this.declinePost());

        let deferPostButton = document.querySelector("#post-text-section .action .defer");
        deferPostButton!.addEventListener("click", _ => this.deferPost());
    }

    addAccount() {
        if(!this.accountList.currentAccount) return;
        let userInput = prompt("Bitte Accountnamen eingeben");
        if(!userInput) return;
        //TODO change postList, remove "if(this.accountList.currentAccount)"
        let newAccount = new PostingAccount(userInput, this.accountList.currentAccount.postList);
        this.accountList.addAccount(newAccount);
        this.accountList.currentAccount = newAccount;
        this.setCurrentPost(this.accountList.currentAccount.getPostsFiltered()[0])
        this.repaintView();
    }
    
    editCurrentAccount() {
        if(!this.accountList.currentAccount) return;
        let userInput = prompt("Bitte neuen Accountnamen eingeben");
        if(!userInput) return;
        this.accountList.currentAccount.setTitle(userInput);
        this.repaintView();
    }
    
    removeCurrentAccount() {
        if(!this.accountList.currentAccount) return;
        if(!confirm("Wollen Sie den Account "+this.accountList.currentAccount.title+" wirklich löschen?")) return;
        accountList.removeAccount(this.accountList.currentAccount);
        this.accountList.currentAccount = null;
        this.setCurrentPost(null)
        this.repaintView();
    } 
    
    acceptPost() {
        if(!this.getCurrentPost() || !this.accountList.currentAccount) return;
        this.accountList.currentAccount.postList.putPostLast(this.getCurrentPost()!);
        navigator.clipboard.writeText(this.getCurrentPost()!.getTextForPosting());
        this.repaintView();
    }
    
    declinePost() {
        if(!this.accountList.currentAccount || !this.getCurrentPost()) return;
        this.accountList.currentAccount.postList.putPostLast(this.getCurrentPost()!);
        this.repaintView();
    }
    
    deferPost() {
        if(!this.accountList.currentAccount || !this.getCurrentPost()) return;
        this.accountList.currentAccount.postList.deferPost(this.getCurrentPost()!);
        this.repaintView();
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
    
    getAccountList() { 
        return this.accountList;
    }

    setAccountList(accountList: AccountList) { 
        this.accountList = accountList;
        this.repaintView();
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