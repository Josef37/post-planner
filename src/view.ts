import { Controller } from './controller';
import { PostingAccount } from './model/posting-account';
import { Post } from './model/post';

export class View {

    private controller: Controller;
    private accountListElement = document.getElementById('account-list');
    private postListElement = document.getElementById('post-list');
    private postTextArea = document.getElementById('post-text');

    public constructor(controller: Controller) {
        this.controller = controller;
        this.makeAccountListSelector();
        this.makePostListSelector();
    }

    public displayAccountList(accounts: PostingAccount[]): void {
        View.displayList(this.accountListElement, accounts.map(
            (account): {id: number; innerHTML: string} => ({id: account.id, innerHTML: account.title})));
        const currentAccount = this.controller.getCurrentAccount();
        if(currentAccount) {
            const currentAccountListItem = document.querySelector('#account-list li[data-id="'+currentAccount.id+'"]');
            currentAccountListItem && currentAccountListItem.toggleAttribute('selected');
        }
    }

    public displayPostList(posts: Post[]): void {
        View.displayList(this.postListElement, posts.map((post): {id: number; innerHTML: string} => ({
            id: post.id,
            innerHTML: `<a href="${post.url}" target="_blank">Link</a> ${post.title}`
        })));
        const currentPost = this.controller.getCurrentPost();
        if(currentPost) {
            const currentPostListItem = document.querySelector('#post-list li[data-id="' + currentPost.id + '"]');
            currentPostListItem && currentPostListItem.toggleAttribute('selected');
        }
    }

    private makeAccountListSelector(): void {
        View.makeListSelector(this.accountListElement, (accountId): void => {
            this.controller.setCurrentAccount(this.controller.getAccountById(accountId));
        });
    }

    private makePostListSelector(): void {
        View.makeListSelector(this.postListElement, (postId): void => {
            if(!this.controller.getCurrentAccount()) return;
            this.controller.setCurrentPost(this.controller.getPostById(postId));
        });
    }

    public displayPostText(post: Post): void {
        if(!this.postTextArea) { console.log('No text area found.'); return; }
        this.postTextArea.innerHTML = post.getTextForPosting();
    }

    public clearPostText(): void {
        if(!this.postTextArea) { console.log('No text area found.'); return; }
        this.postTextArea.innerHTML = '';
    }

    //TODO: Show Post List Elements with Link and title (for hovering)
    public static displayList(list: HTMLElement | null, elements: {id: number; innerHTML: string}[]): void {
        if(!list) { console.log('No list given.'); return; }
        Array.from(list.children).forEach((element): void => element.remove());
        for(const element of elements) {
            const listItem = document.createElement('li');
            listItem.innerHTML = element.innerHTML;
            listItem.setAttribute('data-id', String(element.id));
            list.appendChild(listItem);
        }
    }

    private static makeListSelector(list: HTMLElement | null, callback: ((id: number) => void)): void {
        if(!list) return;
        list.addEventListener('click', (event): void => {
            Array.from(list.children)
                .filter((listItem): boolean => listItem === event.target)
                .forEach((listItem): void => callback(Number(listItem.getAttribute('data-id'))));
        });
    }
    
}