import { PostingAccount } from "./posting-account";

export class AccountList {

    currentAccount: PostingAccount | null = null;
    
    constructor(public accounts: PostingAccount[]) {}

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

    getAccountById(accountId: number): PostingAccount {
        let filtered = this.accounts.filter(account => account.id === accountId);
        if(filtered.length === 1) return filtered[0];
        throw "Account not found or ambigous";
    }
}