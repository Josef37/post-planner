import { AccountList } from './model/account-list';
import { PostingAccount } from './model/posting-account';
import { Post } from './model/post';
import { View } from './view';
import { Persistence } from './persistence';
import { Dialog } from './dialog';
import { PostList } from './model/post-list';
import { Utils } from './utils';

export class Controller {
    private view: View;
    private accountList: AccountList;
    
    /**
     * Creates a controller that mediates between view and model.
     * Instanciates the view and registers all buttons.
     * @param accountList the data model
     */
    public constructor(accountList: AccountList) {
        this.accountList = accountList;
        this.view = new View(this);
        this.repaintView();

        const undoButton = document.getElementById('undo-button');
        undoButton && undoButton.addEventListener('click', (): void => this.undo());
        const redoButton = document.getElementById('redo-button');
        redoButton && redoButton.addEventListener('click', (): void => this.redo());
        
        const editAccountButton = document.getElementById('edit-account-button');
        editAccountButton && editAccountButton.addEventListener('click', (): void => this.editCurrentAccount());
        const addAccountButton = document.getElementById('add-account-button');
        addAccountButton && addAccountButton.addEventListener('click', (): void => this.addAccount());
        const removeAccountButton = document.getElementById('remove-account-button');
        removeAccountButton && removeAccountButton.addEventListener('click', (): void => this.removeCurrentAccount());
        
        const editPostButton = document.getElementById('edit-post-button');
        editPostButton && editPostButton.addEventListener('click', (): void => this.editPost());
        const addPostButton = document.getElementById('add-post-button');
        addPostButton && addPostButton.addEventListener('click', (): void => this.addPost());
        const filterPostButton = document.getElementById('filter-post-button');
        filterPostButton && filterPostButton.addEventListener('click', (): void => this.filterPost());
        const removePostButton = document.getElementById('remove-post-button');
        removePostButton && removePostButton.addEventListener('click', (): void => this.removeCurrentPosts());
        const editPostListsButton = document.getElementById('edit-post-list-button');
        editPostListsButton && editPostListsButton.addEventListener('click', (): void => this.editPostLists());

        const acceptPostButton = document.getElementById('accept-post-button');
        acceptPostButton && acceptPostButton.addEventListener('click', (): void => this.acceptPost());
        const declinePostButton = document.getElementById('decline-post-button');
        declinePostButton && declinePostButton.addEventListener('click', (): void => this.declinePost());
        const deferPostButton = document.getElementById('defer-post-button');
        const deferPostInput = document.getElementById('defer-post-positions-input');
        deferPostButton && deferPostButton.addEventListener('click', (): void => {
            let positions;
            if(deferPostInput instanceof HTMLInputElement) positions = Number(deferPostInput.value);
            this.deferPost(positions);
        });
        const editPostTextButton = document.getElementById('edit-post-text-button');
        editPostTextButton && editPostTextButton.addEventListener('click', (): void => this.editPostText());
    }

    /**
     * Add an account through a dialog.
     * Set title, post list and filtered posts.
     */
    private addAccount(): void {
        Dialog.addAccount(this.accountList.postLists, (title, postListId, postIds): string | void => {
            if(title == "") return 'Der Titel darf nicht leer sein.';
            const newAccount = new PostingAccount(
                title,
                this.accountList.getPostListById(postListId),
                new Set(postIds
                    .map((postId): (Post | null) => this.accountList.getPostById(postId))
                    .filter((post): (Post | null) => post) as Post[]),
            );
            this.accountList.addAccount(newAccount);
            this.accountList.currentAccount = newAccount;
            this.repaintAndSave();
        });
    }

    /**
     * Edit the current account trough a dialog.
     * Edit title, post list and filtered posts
     */
    //TODO: Let Users copy filters from other accounts or create custom filters, that are shared between users
    private editCurrentAccount(): void {
        const account = this.accountList.currentAccount;
        if (!account) return;
        Dialog.editAccount(
            account.title,
            account.postList ? account.postList.id : 0,
            Array.from(account.filteredPosts).map((post): number => post.id).sort(),
            this.accountList.postLists,
            (title, postListId, postIds): string | void => {
                if(title == "") return 'Der Titel darf nicht leer sein.';
                account.title = title;
                account.postList = this.accountList.getPostListById(postListId);
                account.filteredPosts = new Set(postIds
                    .map((postId): (Post | null) => this.accountList.getPostById(postId))
                    .filter((post): (Post | null) => post) as Post[]);
                this.repaintAndSave();
            },
        );
    }

    /**
     * Removes the current account with dialog confirmation.
     */
    private removeCurrentAccount(): void {
        const account = this.accountList.currentAccount;
        if (!account) return;
        Dialog.confirm(`Willst du wirklich den Account ${account.title} löschen?`, (): string | void => {
            this.accountList.removeAccount(account);
            this.accountList.currentAccount = null;
            this.repaintAndSave();
        });
    }

    /**
     * Edit post lists by renaming.
     * Empty names indicate deleting the list.
     */
    private editPostLists(): void {
        const postLists = this.accountList.postLists;
        //TODO: Let list be renamed, when they are in use (by returning an error message)
        Dialog.editPostLists(
            postLists,
            postLists.map((list): boolean => !!this.accountList.accounts.find((account): boolean => account.postList == list)),
            (titles): string | void => {
                for (let i = 0; i < titles.length; i++) {
                    const title = titles[i];
                    if (i >= postLists.length) {
                        title && postLists.push(postLists.length > 0 ? postLists[0].copy(title) : new PostList(title)); //TODO: Dont just copy
                    } else if (title == '') {
                        delete postLists[i];
                    }
                }
                this.accountList.postLists = postLists.filter((list): PostList => list);
            },
        );
    }

    /**
     * Edits the posts title and url by a dialog. Select the accounts that filter it.
     * Only works with one selected post
     */
    private editPost(): void {
        const posts = this.getCurrentPosts();
        if (!posts || posts.size !== 1) return;
        const post = posts.values().next().value;
        const accounts = this.accountList.accounts.map((account): { id: number; title: string; filtered: boolean } => {
            return {id: account.id, title: account.title, filtered: account.filteredPosts.has(post)}
        });
        Dialog.editPost(post.title, post.url, accounts, (title, url, filteringAccounts): string | void => {
            if(title == "") return 'Der Titel darf nicht leer sein.';
            if(!Utils.isValidURL(url)) return 'Die URL ist nicht gültig.';
            post.title = title;
            post.url = url;
            filteringAccounts.forEach((value): void => {
                const account = this.getAccountById(value.id);
                if(value.filtered) account && account.filterPost(post);
                else account && account.unfilterPost(post);
            });
            this.repaintAndSave();
        });
    }

    /**
     * Add a post to all post lists. Select the accounts that filter it.
     */
    private addPost(): void {
        const accounts = this.accountList.accounts.map((account): { id: number; title: string; filtered: boolean } => {
            return {id: account.id, title: account.title, filtered: false}
        });
        Dialog.addPost(accounts, (title, url, filteringAccounts): string | void => {
            if(title == "") return 'Der Titel darf nicht leer sein.';
            if(!Utils.isValidURL(url)) return 'Die URL ist nicht gültig.';
            const post = new Post(title, url);
            this.accountList.addPost(post);
            filteringAccounts.forEach((value): void => {
                const account = this.getAccountById(value.id);
                if(value.filtered) account && account.filterPost(post);
                else account && account.unfilterPost(post);
            });
            this.repaintAndSave();
        });
    }

    /**
     * Filters current post for current account
     */
    private filterPost(): void {
        const [currentAccount, currentPosts] = [this.accountList.currentAccount, this.getCurrentPosts()];
        if (!currentAccount || !currentPosts) return;
        currentAccount.filterPosts(currentPosts);
        currentAccount.selectFirstPost();
        this.repaintAndSave();
    }

    /**
     * Removes current post from all post lists
     */
    private removeCurrentPosts(): void {
        const currentPosts = this.getCurrentPosts();
        currentPosts && Dialog.confirm(
            `Willst du wirklich die Posts ${Array.from(currentPosts).map((post): string => post.title).join(', ')} überall löschen?`, 
            (): string | void => {
                this.accountList.removePosts(currentPosts);
                this.repaintAndSave();
            });
    }

    /**
     * Copies the posting text to the clipboard and moves the post to the end within the current post list 
     * and selects the first post in the list. Only works with one selected post.
     */
    private acceptPost(): void {
        const currentPosts = this.getCurrentPosts();
        const currentAccount = this.accountList.currentAccount;
        if (!currentPosts || currentPosts.size !== 1 || !currentAccount || !currentAccount.postList) return;
        const currentPost = currentPosts.values().next().value;
        currentAccount.postList.putPostLast(currentPost);
        navigator.clipboard.writeText(currentPost.getTextForPosting());
        currentAccount.selectFirstPost();
        this.repaintAndSave();
    }

    /**
     * Moves the current post to the end of the current post list and selects the first post in the list.
     */
    private declinePost(): void {
        const currentPosts = this.getCurrentPosts();
        const currentAccount = this.accountList.currentAccount;
        if (!currentAccount || !currentPosts) return;
        currentPosts.forEach((post): void => { currentAccount.postList && currentAccount.postList.putPostLast(post) });
        currentAccount.selectFirstPost();
        this.repaintAndSave();
    }

    /**
     * Moves the post down a few positions within the current post list and selects the first post in the list.
     */
    private deferPost(positions?: number): void {
        const currentPosts = this.getCurrentPosts();
        const currentAccount = this.accountList.currentAccount;
        if (!currentAccount || !currentPosts) return;
        currentPosts.forEach((post): void => { currentAccount.postList && currentAccount.postList.deferPost(post, positions) });
        currentAccount.selectFirstPost();
        this.repaintAndSave();
    }

    /**
     * Creates a dialog to edit the posts text (not the url)
     */
    private editPostText(): void {
        const currentPosts = this.getCurrentPosts();
        if (!currentPosts || currentPosts.size !== 1) return;
        const currentPost = currentPosts.values().next().value;
        Dialog.editPostText(currentPost.title, currentPost.url, currentPost.text, 
            (newText): string | void => {
                currentPost.text = newText;
                this.repaintAndSave();
            });
    }

    /**
     * Get an account by its id
     */
    public getAccountById(accountId: number): PostingAccount | null {
        return this.accountList.getAccountById(accountId);
    }

    /**
     * Repaints the view depending on selected elements.
     */
    private repaintView(): void {
        // Shows the post list, if there is one account selected
        this.view.displayAccountList(this.accountList.accounts);
        if (this.accountList.currentAccount) {
            this.view.displayPostList(this.accountList.currentAccount.getPostsFiltered() || []);
        } else {
            this.view.displayPostList([]);
        }
        // Shows the post text, if there is only one post selected
        const currentPosts = this.getCurrentPosts();
        if (currentPosts && currentPosts.size === 1) {
            this.view.displayPostText(currentPosts.values().next().value);
        } else {
            this.view.clearPostText();
        }
    }

    /**
     * Load the latest state from a file
     */
    private load(): void {
        this.accountList = Persistence.load();
        this.repaintView();
    }

    /**
     * Save the current state in a file.
     */
    private save(): void {
        new Persistence(this.accountList).save();
    }

    /**
     * Undo the last change. 
     * Only possible for saved actions.
     */
    private undo(): void {
        this.accountList = Persistence.undo();
        this.repaintView();
    }

    /**
     * Redo the last undo. Only possible if there was no change between the undo/redo actions.
     * Only possible for saved actions.
     */
    private redo(): void {
        this.accountList = Persistence.redo();
        this.repaintView();
    }

    /**
     * Repaints the view and saves the model in a file
     */
    private repaintAndSave(): void {
        this.repaintView();
        this.save();
    }

    /**
     * Get the currently selected account
     */
    public getCurrentAccount(): PostingAccount | null {
        return this.accountList.currentAccount;
    }

    /**
     * Sets the account as currently selected
     */
    public setCurrentAccount(account: PostingAccount | null): void {
        this.accountList.currentAccount = account;
        this.repaintView();
    }

    /**
     * Gets the current post, if an account is selected
     */
    public getCurrentPosts(): Set<Post> | null {
        const currentAccount = this.accountList.currentAccount;
        return currentAccount && currentAccount.currentPosts;
    }

    /**
     * Sets the current post for the current account, if there is one
     */
    public setCurrentPost(post: Post | null): void {
        const currentAccount = this.accountList.currentAccount;
        if (!currentAccount) return;
        currentAccount.setCurrentPost(post);
        this.repaintView();
    }

    /**
     * Adds the post to current posts for the current account, if there is one
     */
    public addCurrentPost(post: Post | null): void {
        const currentAccount = this.accountList.currentAccount;
        if (!currentAccount) return;
        currentAccount && post && currentAccount.currentPosts.add(post);
        this.repaintView();
    }

    /**
     * Gets the post with the given id, if it is found
     */
    public getPostById(postId: number): Post | null {
        return this.accountList.getPostById(postId);
    }
}
