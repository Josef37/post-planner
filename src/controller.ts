import { AccountList } from './model/account-list';
import { PostingAccount } from './model/posting-account';
import { Post } from './model/post';
import { View } from './view';
import { Persistence } from './persistence';
import { Dialog } from './dialog';
import { PostList } from './model/post-list';

export class Controller {
    private view: View;
    private accountList: AccountList;
    
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
        
        const addPostButton = document.getElementById('add-post-button');
        addPostButton && addPostButton.addEventListener('click', (): void => this.addPost());
        const filterPostButton = document.getElementById('filter-post-button');
        filterPostButton && filterPostButton.addEventListener('click', (): void => this.filterPost());
        const editPostButton = document.getElementById('edit-post-button');
        editPostButton && editPostButton.addEventListener('click', (): void => this.editPost());
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

    private addAccount(): void {
        Dialog.addAccount(this.accountList.postLists, (title, postListId, postIds): void => {
            const newAccount = new PostingAccount().init(
                title,
                this.accountList.getPostListById(postListId),
                new Set(postIds
                    .map((postId): (Post|undefined) => this.accountList.getPostById(postId))
                    .filter((post): (Post|undefined) => post) as Post[]),
            );
            this.accountList.addAccount(newAccount);
            this.accountList.currentAccount = newAccount;
            this.repaintAndSave();
        });
    }

    private editCurrentAccount(): void {
        const account = this.getCurrentAccount();
        if (!account) return;
        Dialog.editAccount(
            account.title,
            account.postList ? account.postList.id : 0,
            Array.from(account.filteredPosts).map((post): number => post.id).sort(),
            this.accountList.postLists,
            (title, postListId, postIds): void => {
                account.title = title;
                account.postList = this.accountList.getPostListById(postListId);
                account.filteredPosts = new Set(postIds
                    .map((postId): (Post|undefined) => this.accountList.getPostById(postId))
                    .filter((post): (Post|undefined) => post) as Post[]);
                this.repaintAndSave();
            },
        );
    }

    private removeCurrentAccount(): void {
        const account = this.accountList.getCurrentAccount();
        if (!account) return;
        Dialog.confirm(`Willst du wirklich den Account ${account.title} löschen?`, (): void => {
            this.accountList.removeAccount(account);
            this.accountList.setCurrentAccount(undefined);
            this.repaintAndSave();
        });
    }

    private editPostLists(): void {
        const { postLists } = this.accountList;
        Dialog.editPostLists(
            postLists,
            postLists.map((list): boolean => !!this.accountList.accounts.find((account): boolean => account.postList == list)),
            (titles): void => {
                for (let i = 0; i < titles.length; i++) {
                    const title = titles[i];
                    if (i >= postLists.length) postLists.push(new PostList(title));
                    else if (title == '') delete postLists[i];
                }
                this.accountList.postLists = postLists.filter((list): PostList => list);
            },
        );
    }

    private addPost(): void {
        Dialog.addPost((title, url): void => {
            this.accountList.addPost(title, url);
            this.repaintAndSave();
        });
    }

    // filters current post for current account
    private filterPost(): void {
        const [currentAccount, currentPost] = [this.getCurrentAccount(), this.getCurrentPost()];
        if (!currentAccount || !currentPost) return;
        currentAccount.filterPost(currentPost);
        currentAccount.setCurrentPost(undefined);
        this.repaintAndSave();
    }

    private editPost(): void {
        const post = this.getCurrentPost();
        if (!post) return;
        Dialog.editPost(post.title, post.url, (title, url): void => {
            post.title = title;
            post.url = url;
            this.repaintAndSave();
        });
    }

    private acceptPost(): void {
        const currentPost = this.getCurrentPost();
        if (!currentPost || !this.accountList.currentAccount || !this.accountList.currentAccount.postList) return;
        this.accountList.currentAccount.postList.putPostLast(currentPost);
        navigator.clipboard.writeText(currentPost.getTextForPosting());
        this.repaintAndSave();
    }

    private declinePost(): void {
        const currentPost = this.getCurrentPost();
        if (!this.accountList.currentAccount || !currentPost || !this.accountList.currentAccount.postList) return;
        this.accountList.currentAccount.postList.putPostLast(currentPost);
        this.repaintAndSave();
    }

    private deferPost(): void {
        const currentPost = this.getCurrentPost();
        if (!this.accountList.currentAccount || !currentPost || !this.accountList.currentAccount.postList) return;
        this.accountList.currentAccount.postList.deferPost(currentPost);
        this.repaintAndSave();
    }

    private editPostText(): void {
        const currentPost = this.getCurrentPost();
        if (!currentPost) return;
        Dialog.editPostText(currentPost.text, (newText): void => {
            currentPost.text = newText;
            this.repaintAndSave();
        });
    }

    public getAccountById(accountId: number): PostingAccount|undefined {
        return this.accountList.getAccountById(accountId);
    }

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

    private load(): void {
        this.accountList = Persistence.load();
        this.repaintView();
    }

    private save(): void {
        new Persistence(this.accountList).save();
    }

    private undo(): void {
        this.accountList = Persistence.undo();
        this.repaintView();
    }

    private redo(): void {
        this.accountList = Persistence.redo();
        this.repaintView();
    }

    private repaintAndSave(): void {
        this.repaintView();
        this.save();
    }

    public getCurrentAccount(): PostingAccount | undefined {
        return this.accountList.currentAccount;
    }

    public setCurrentAccount(account: PostingAccount | undefined): void {
        this.accountList.setCurrentAccount(account);
        this.repaintView();
    }

    public getCurrentPost(): Post | undefined {
        const currentAccount = this.accountList.getCurrentAccount();
        if (currentAccount) return currentAccount.getCurrentPost();
    }

    public setCurrentPost(post: Post | undefined): void {
        const currentAccount = this.accountList.getCurrentAccount();
        if (!currentAccount) return;
        currentAccount.setCurrentPost(post);
        this.repaintView();
    }

    public getPostById(postId: number): Post|undefined {
        return this.accountList.getPostById(postId);
    }
}
