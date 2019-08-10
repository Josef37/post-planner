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
        removePostButton && removePostButton.addEventListener('click', (): void => this.removeCurrentPost());
        const editPostListsButton = document.getElementById('edit-post-list-button');
        editPostListsButton && editPostListsButton.addEventListener('click', (): void => this.editPostLists());

        const acceptPostButton = document.getElementById('accept-post-button');
        acceptPostButton && acceptPostButton.addEventListener('click', (): void => this.acceptPost());
        const declinePostButton = document.getElementById('decline-post-button');
        declinePostButton && declinePostButton.addEventListener('click', (): void => this.declinePost());
        const deferPostButton = document.getElementById('defer-post-button');
        deferPostButton && deferPostButton.addEventListener('click', (): void => this.deferPost());
        const editPostTextButton = document.getElementById('edit-post-text-button');
        editPostTextButton && editPostTextButton.addEventListener('click', (): void => this.editPostText());
    }

    /**
     * Add an account through a dialog.
     * Set title, post list and filtered posts.
     */
    private addAccount(): void {
        Dialog.addAccount(this.accountList.postLists, (title, postListId, postIds): boolean => {
            if(title == "") return false;
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
            return true;
        });
    }

    /**
     * Edit the current account trough a dialog.
     * Edit title, post list and filtered posts
     */
    private editCurrentAccount(): void {
        const account = this.accountList.currentAccount;
        if (!account) return;
        Dialog.editAccount(
            account.title,
            account.postList ? account.postList.id : 0,
            Array.from(account.filteredPosts).map((post): number => post.id).sort(),
            this.accountList.postLists,
            (title, postListId, postIds): boolean => {
                if(title == "") return false;
                account.title = title;
                account.postList = this.accountList.getPostListById(postListId);
                account.filteredPosts = new Set(postIds
                    .map((postId): (Post | null) => this.accountList.getPostById(postId))
                    .filter((post): (Post | null) => post) as Post[]);
                this.repaintAndSave();
                return true;
            },
        );
    }

    /**
     * Removes the current account with dialog confirmation.
     */
    private removeCurrentAccount(): void {
        const account = this.accountList.currentAccount;
        if (!account) return;
        Dialog.confirm(`Willst du wirklich den Account ${account.title} löschen?`, (): boolean => {
            this.accountList.removeAccount(account);
            this.accountList.currentAccount = null;
            this.repaintAndSave();
            return true;
        });
    }

    /**
     * Edit post lists by renaming.
     * Empty names indicate deleting the list.
     */
    private editPostLists(): void {
        const postLists = this.accountList.postLists;
        Dialog.editPostLists(
            postLists,
            postLists.map((list): boolean => !!this.accountList.accounts.find((account): boolean => account.postList == list)),
            (titles): boolean => {
                for (let i = 0; i < titles.length; i++) {
                    const title = titles[i];
                    if (i >= postLists.length) {
                        postLists.push(new PostList(title, postLists.length > 0 ? postLists[0].posts : undefined)); //TODO: Dont just copy
                    } else if (title == '') {
                        delete postLists[i];
                    }
                }
                this.accountList.postLists = postLists.filter((list): PostList => list);
                return true;
            },
        );
    }

    /**
     * Add a post to all post lists.
     */
    private addPost(): void {
        Dialog.addPost((title, url): boolean => {
            if(title == "" || !Utils.isvalidURL(url)) return false;
            this.accountList.addPost(new Post(title, url));
            this.repaintAndSave();
            return true;
        });
    }

    /**
     * Filters current post for current account
     */
    private filterPost(): void {
        const [currentAccount, currentPost] = [this.accountList.currentAccount, this.getCurrentPost()];
        if (!currentAccount || !currentPost) return;
        currentAccount.filterPost(currentPost);
        currentAccount.currentPost = null;
        this.repaintAndSave();
    }

    /**
     * Removes current post from all post lists
     */
    private removeCurrentPost(): void {
        const currentPost = this.getCurrentPost();
        currentPost && Dialog.confirm(`Willst du wirklich den Post ${currentPost.title} überall löschen?`, (): boolean => {
            this.accountList.removePost(currentPost);
            this.repaintAndSave();
            return true;
        });
    }

    /**
     * Edits the posts title and url by a dialog
     */
    private editPost(): void {
        const post = this.getCurrentPost();
        if (!post) return;
        Dialog.editPost(post.title, post.url, (title, url): boolean => {
            if(title == "" || !Utils.isvalidURL(url)) return false;
            post.title = title;
            post.url = url;
            this.repaintAndSave();
            return true;
        });
    }

    /**
     * Copies the posting text to the clipboard and moves the post to the end within the current post list.
     */
    private acceptPost(): void {
        const currentPost = this.getCurrentPost();
        const currentAccount = this.accountList.currentAccount;
        if (!currentPost || !currentAccount || !currentAccount.postList) return;
        currentAccount.postList.putPostLast(currentPost);
        navigator.clipboard.writeText(currentPost.getTextForPosting());
        this.repaintAndSave();
    }

    /**
     * Moves the current post to the end of the current post list.
     */
    private declinePost(): void {
        const currentPost = this.getCurrentPost();
        if (!this.accountList.currentAccount || !currentPost || !this.accountList.currentAccount.postList) return;
        this.accountList.currentAccount.postList.putPostLast(currentPost);
        this.repaintAndSave();
    }

    /**
     * Moves the post down a few positions within the current post list
     */
    private deferPost(): void {
        const currentPost = this.getCurrentPost();
        if (!this.accountList.currentAccount || !currentPost || !this.accountList.currentAccount.postList) return;
        this.accountList.currentAccount.postList.deferPost(currentPost);
        this.repaintAndSave();
    }

    /**
     * Creates a dialog to edit the posts text (not the url)
     */
    private editPostText(): void {
        const currentPost = this.getCurrentPost();
        if (!currentPost) return;
        Dialog.editPostText(currentPost.text, (newText): boolean => {
            currentPost.text = newText;
            this.repaintAndSave();
            return true;
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
        this.view.displayAccountList(this.accountList.accounts);
        if (this.accountList.currentAccount) {
            this.view.displayPostList(this.accountList.currentAccount.getPostsFiltered() || []);
        } else {
            this.view.displayPostList([]);
        }
        const currentPost = this.getCurrentPost();
        if (currentPost) {
            this.view.displayPostText(currentPost);
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
     * Gets the current post, if an account and post are selected
     */
    public getCurrentPost(): Post | null {
        const currentAccount = this.accountList.currentAccount;
        return currentAccount && currentAccount.currentPost;
    }

    /**
     * Sets the current post for the current account, if there is one
     */
    public setCurrentPost(post: Post | null): void {
        const currentAccount = this.accountList.currentAccount;
        if (!currentAccount) return;
        currentAccount.currentPost = post;
        this.repaintView();
    }

    /**
     * Gets the post with the given id, if it is found
     */
    public getPostById(postId: number): Post | null {
        return this.accountList.getPostById(postId);
    }
}
