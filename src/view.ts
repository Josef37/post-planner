import { Controller } from "./controller";
import { PostingAccount } from "./model/posting-account";
import { Post } from "./model/post";

export class View {

    accountListElement = document.getElementById("account-list");
    postListElement = document.getElementById("post-list");
    postTextArea = document.getElementById("post-text");

    constructor(public controller: Controller) {
        this.makeAccountListSelector();
        this.makePostListSelector();
    }

    displayAccountList(accounts: PostingAccount[]) {
        View.displayList(this.accountListElement, accounts);
        let currentAccount = this.controller.getCurrentAccount();
        if(currentAccount) {
            document.querySelector('#account-list li[data-id="'+currentAccount.id+'"]')!.toggleAttribute("selected");
        }
    }

    displayPostList(posts: Post[]) {
        View.displayList(this.postListElement, posts);
        let currentPost = this.controller.getCurrentPost();
        if(currentPost) {
            document.querySelector('#post-list li[data-id="'+currentPost.id+'"]')!.toggleAttribute("selected");
        }
    }

    makeAccountListSelector() {
        View.makeListSelector(this.accountListElement, accountId => {
            this.controller.setCurrentAccount(this.controller.getAccountById(accountId));
        });
    }

    makePostListSelector() {
        View.makeListSelector(this.postListElement, postId => {
            if(!this.controller.getCurrentAccount()) return;
            this.controller.setCurrentPost(this.controller.getPostById(postId));
        });
    }

    displayPostText(post: Post) {
        if(!this.postTextArea) { console.log("No text area found."); return; }
        this.postTextArea.innerHTML = post.getTextForPosting();
    }

    clearPostText() {
        if(!this.postTextArea) { console.log("No text area found."); return; }
        this.postTextArea.innerHTML = "";
    }

    //TODO: Show Post List Elements with Link and title (for hovering)
    static displayList(list: HTMLElement | null, elements: {id: number, title: string}[]) {
        if(!list) { console.log("No list given."); return; }
        Array.from(list.children).forEach(element => element.remove());
        for(let element of elements) {
            let listItem = document.createElement("li");
            listItem.innerText = element.title;
            listItem.setAttribute("data-id", String(element.id));
            list.appendChild(listItem);
        }
    }

    static clearList(list: HTMLElement | null) {
        View.displayList(list, []);
    }

    static makeListSelector(list: HTMLElement | null, callback: ((id: number) => void)) {
        if(!list) return;
        list.addEventListener("click", (event) => {
            Array.from(list.children)
                .filter(listItem => listItem === event.target)
                .forEach(listItem => callback(Number(listItem.getAttribute("data-id"))));
        });
    }
    
}