import { Controller } from './controller';
import { Post } from './model/post';
import { PostingAccount } from './model/posting-account';

export class View {

    private controller: Controller;
    private accountListElement = document.getElementById('account-list');
    private postListElement = document.getElementById('post-list');
    private postTextArea = document.getElementById('post-text');

    /**
     * Responsible for displaying the data
     * @param controller The Controller mediating between model and view
     */
    public constructor(controller: Controller) {
        this.controller = controller;
        this.makeAccountListSelector();
        this.makePostListSelector();
    }

    /**
     * Shows the accounts by title in the accountListElement. Adds an data-id to reference.
     * Highlights the currently selected account.
     * @param accounts The accounts to be displayed
     */
    public displayAccountList(accounts: PostingAccount[]): void {
        this.accountListElement && View.displayList(this.accountListElement, accounts.map(
            (account): {id: number; innerHTML: string} => ({id: account.id, innerHTML: account.title})));
        const currentAccount = this.controller.getCurrentAccount();
        if(currentAccount) {
            const currentAccountListItem = document.querySelector('#account-list li[data-id="'+currentAccount.id+'"]');
            currentAccountListItem && currentAccountListItem.toggleAttribute('selected');
        }
    }

    /**
     * Shows the posts by title and url in the accountListElement. Adds an data-id to reference.
     * Highlights the currently selected post.
     * @param posts The posts to be displayed
     */
    public displayPostList(posts: Post[]): void {
        this.postListElement && View.displayList(this.postListElement, 
            posts.map((post): {id: number; innerHTML: string} => ({
                id: post.id,
                innerHTML: `<a href="${post.url}" target="_blank">Link</a> ${post.title}`
            })));
        const currentPost = this.controller.getCurrentPost();
        if(currentPost) {
            const currentPostListItem = document.querySelector('#post-list li[data-id="' + currentPost.id + '"]');
            currentPostListItem && currentPostListItem.toggleAttribute('selected');
        }
    }

    /**
     * Makes the account list selectable.
     */
    private makeAccountListSelector(): void {
        View.makeListSelector(this.accountListElement, (accountId): void => {
            this.controller.setCurrentAccount(this.controller.getAccountById(accountId));
        });
    }

    /**
     * Makes the post list selectable. But only if there is a current account selected.
     */
    private makePostListSelector(): void {
        View.makeListSelector(this.postListElement, (postId): void => {
            if(!this.controller.getCurrentAccount()) return;
            this.controller.setCurrentPost(this.controller.getPostById(postId));
        });
    }

    /**
     * Displays the posts text in the postTextArea.
     * @param post The post to display the text from.
     */
    public displayPostText(post: Post): void {
        if(!this.postTextArea) { console.log('No text area found.'); return; }
        this.postTextArea.innerHTML = post.getTextForPosting();
    }

    /**
     * Clears the posts text from the postTextArea.
     */
    public clearPostText(): void {
        if(!this.postTextArea) throw new Error('No text area found.');
        this.postTextArea.innerHTML = '';
    }

    /**
     * Clears the list and adds list elements with given innerHTML and data-id (for referencing)
     * @param list Where to display
     * @param elements id and innerHTML to display
     */
    public static displayList(list: HTMLElement, elements: {id: number; innerHTML: string}[]): void {
        Array.from(list.children).forEach((element): void => element.remove());
        for(const element of elements) {
            const listItem = document.createElement('li');
            listItem.innerHTML = element.innerHTML;
            listItem.setAttribute('data-id', String(element.id));
            list.appendChild(listItem);
        }
    }

    /**
     * Calls the callback on click.
     * @param list Where to select from
     * @param callback Gets called on click with the selected id
     */
    private static makeListSelector(list: HTMLElement | null, callback: ((id: number) => void)): void {
        if(!list) return;
        list.addEventListener('click', (event): void => {
            Array.from(list.children)
                .filter((listItem): boolean => listItem === event.target)
                .forEach((listItem): void => callback(Number(listItem.getAttribute('data-id'))));
        });
    }
    
}