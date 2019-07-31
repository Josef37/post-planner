let postList = new PostList();
postList.addPost(new Post("Post 1", "URL1", "Post Text 1"));
postList.addPost(new Post("Post 2", "URL2", "Post Text 2"));
postList.addPost(new Post("Post 3", "URL3", "Post Text 3"));
postList.addPost(new Post("Post 4", "URL4", "Post Text 4"));

let accountList = new AccountList([
    new PostingAccount("Angi", postList),
    new PostingAccount("Josef", postList, new Set([postList.posts[0], postList.posts[1]])),
    new PostingAccount("Robin", postList, new Set([postList.posts[2], postList.posts[3]]))
]);
let currentAccount: PostingAccount | null = null;
let currentPost = null;

let accountListElement = document.getElementById("account-list");
let postListElement = document.getElementById("post-list");
let postTextArea = document.getElementById("post-text");

loadList(accountListElement, accountList.getAccounts().map(account => account.name));
if (accountListElement) generateListSelector(accountListElement, (_account, index) => {
    currentAccount = accountList.getAccounts()[index];
    loadList(postListElement, currentAccount.getPostsFiltered().map(post => post.title));
});
if (postListElement) generateListSelector(postListElement, (_post, index) => {
    if(currentAccount) {
        currentPost = currentAccount.getPostsFiltered()[index];
        loadPostText(currentPost);
    }
});

function generateListSelector(list: HTMLElement, callback?: ((element: Element, index: number) => void) | undefined) {
    list.addEventListener("click", (event) => {
        Array.from(list.children).forEach((element, index) => {
            element.removeAttribute("selected");
            if(element == event.target) {
                element.toggleAttribute("selected");
                if(callback) callback(element, index);
            }
        })
    });
}

function loadPostText(post: Post) {
    if(!postTextArea) { console.log("No text area found."); return; }
    postTextArea.innerHTML = post.text + '\n\n' + post.url;
}

function clearPostText() {
    if(!postTextArea) { console.log("No text area found."); return; }
    postTextArea.innerHTML = "";
}

function loadList(list: HTMLElement | null, innerHTMLs: string[]) {
    if(!list) { console.log("No list given."); return; }
    Array.from(list.children).forEach(element => element.remove());
    for(let innerHTML of innerHTMLs) {
        let listItem = document.createElement("li");
        listItem.innerHTML = innerHTML;
        list.appendChild(listItem);
    }
}

function clearList(list: HTMLElement | null) {
    loadList(list, []);
}

function addAccount() {
    if(!accountListElement) { console.log("No account list found."); return; }
    let userInput = prompt("Bitte Accountnamen eingeben");
    if(!userInput) return;
    let listItem = document.createElement("li");
    listItem.innerHTML = userInput;
    accountListElement.appendChild(listItem);
    accountList.addAccount(new PostingAccount(userInput, postList));
}

function editCurrentAccount() {
    if(!accountListElement || !currentAccount) { console.log("No account list or current account found."); return; }
    let listItem = document.querySelector('#account-list li[selected]');
    if(!listItem) { console.log("No list item found"); return; }
    let userInput = prompt("Bitte neuen Accountnamen eingeben");
    if(!userInput) return;
    listItem.innerHTML = userInput;
    currentAccount.setName(userInput);
}

function removeCurrentAccount() {
    if(!accountListElement || !currentAccount) { console.log("No account list or current account found."); return; }
    let listItem = document.querySelector('#account-list li[selected]');
    if(!listItem) { console.log("No list item found"); return; }
    if(!confirm("Wollen Sie den Account "+currentAccount.name+" wirklich löschen?")) return;
    listItem.remove();
    accountList.removeAccount(currentAccount);
    clearList(postListElement);
    clearPostText();
}

let addAccountButton = document.querySelector("#accounts-section .action .add");
if(addAccountButton) addAccountButton.addEventListener("click", addAccount);

let editAccountButton = document.querySelector("#accounts-section .action .edit");
if(editAccountButton) editAccountButton.addEventListener("click", editCurrentAccount);

let removeAccountButton = document.querySelector("#accounts-section .action .remove");
if(removeAccountButton) removeAccountButton.addEventListener("click", removeCurrentAccount);