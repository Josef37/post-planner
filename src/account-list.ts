class AccountList {
    
    constructor(public accounts: PostingAccount[]) {}

    addAccount(account: PostingAccount) {
        this.accounts.push(account);
    }

    removeAccount(account: PostingAccount) {
        let index = this.accounts.indexOf(account);
        if(index >= 0) this.accounts.splice(index, 1);
    }

    getAccounts() { return this.accounts; }
}