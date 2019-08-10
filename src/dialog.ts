import { PostList } from './model/post-list';
import { View } from './view';

export class Dialog {
    
    /**
     * Creates a dialog on top of the document with a cancel and confirm button. Only closes on valid inputs.
     * @param nodes the html elements to be shown inside the dialog
     * @param onconfirm the action to perform on user confirmation, returning an error message on invalid inputs
     */
    private static createDialog(nodes: (string | Node)[], onconfirm: () => string | void): void {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);

        const dialog = document.createElement('div');
        dialog.className = 'dialog';
        overlay.appendChild(dialog);

        dialog.append(...nodes);

        const buttonRow = document.createElement('div');
        buttonRow.className = 'button-row';
        dialog.appendChild(buttonRow);

        const cancel = document.createElement('button');
        cancel.innerText = 'Abbrechen';
        cancel.type = 'button';
        cancel.addEventListener('click', (): void => { document.body.removeChild(overlay) });
        buttonRow.appendChild(cancel);

        const confirm = document.createElement('button');
        confirm.innerText = 'Übernehmen';
        confirm.type = 'button';
        confirm.addEventListener('click', (): void => {
            const message = onconfirm();
            if(message) Dialog.showErrorMessage(message);
            else document.body.removeChild(overlay);
        });
        buttonRow.appendChild(confirm);
    }

    /**
     * Shows an error message popup, which will be removed after timeout or when clicked
     * @param message the message to be displayed
     * @param timeout the time in milliseconds after which the message is closed
     */
    public static showErrorMessage(message: string, timeout: number = 5000): void {
        const div = document.createElement('div');
        div.setAttribute('class', 'error-message-popup');
        div.innerText = message;
        setTimeout((): void => { document.body.removeChild(div) }, timeout);
        div.addEventListener('click', (): void => { document.body.removeChild(div) });
        document.body.appendChild(div);
    }

    /**
     * Creates a simple yes/no dialog
     * @param question the question of the dialog
     * @param onconfirm the action to perform on user confirmation
     */
    public static confirm(question: string, onconfirm: () => string | void): void {
        Dialog.createDialog([question], onconfirm);
    }

    /**
     * Creates a dialog to edit text
     * @param postText the current post text
     * @param onconfirm the action to perform with the new post text on user confirmation
     */
    public static editPostText(postText: string, onconfirm: (newPostText: string) => string | void): void {
        const textarea = document.createElement('textarea');
        textarea.value = postText;
        Dialog.createDialog([textarea], (): string | void => onconfirm(textarea.value.trim()));
    }
    
    /**
     * Creates an div container with label and input field
     * @param id the id of the input field
     * @param labelHTML innerHTML of the label
     * @param inputValue the current value of the input field
     * @param inputType the type of the input field
     */
    public static createInputDiv(id: string, labelHTML: string, inputValue: string, inputType: string = 'text'): [HTMLDivElement, HTMLInputElement] {
        const label = document.createElement('label');
        label.setAttribute('for', id);
        label.setAttribute('class', 'text-input-label');
        label.innerHTML = labelHTML;
        const input = document.createElement('input');
        input.id = id;
        input.value = inputValue;
        input.type = inputType;
        const div = document.createElement('div');
        div.className = 'container';
        div.append(label, input);
        return [div, input];
    }

    /**
     * Shows two input fields for post title and url
     * @param onconfirm the action to perform with the new post information on user confirmation
     * @param accounts a list of all account ids, titles and if they filter the post (here false)
     */
    public static addPost(accounts: {id: number; title: string; filtered: boolean}[], 
        onconfirm: (title: string, url: string, filteringAccounts: {id: number; filtered: boolean}[]) => string | void): void {

        Dialog.editPost('', '', accounts, onconfirm);
    }
    
    /**
     * Shows two input fields for post title and url to edit
     * @param title The current title of the post
     * @param url The current url of the post
     * @param accounts a list of all account titles and if they filter the post
     * @param onconfirm the action to perform with the new post information on user confirmation
     */
    public static editPost(title: string, url: string, accounts: {id: number; title: string; filtered: boolean}[],
        onconfirm: (title: string, url: string, filteringAccounts: {id: number; filtered: boolean}[]) => string | void): void {

        const leftCol = document.createElement('div');
        leftCol.setAttribute('class', 'column');
        const rightCol = document.createElement('div');
        rightCol.setAttribute('class', 'column');

        const [titleDiv, titleInput] = this.createInputDiv('title-input', 'Post Titel', title);
        const [urlDiv, urlInput] = this.createInputDiv('url-input', 'Post URL', url, 'url');
        leftCol.append(titleDiv, urlDiv);

        // checkbox list of filtering accounts
        rightCol.innerText = 'Anzeigende Accounts';
        const accountList = document.createElement('ul');
        View.displayList(accountList, accounts.map((account): {id: number; innerHTML: string} => { 
            return {
                id: account.id,
                innerHTML: `<input type="checkbox"${account.filtered ? '' : ' checked'} name="account-${account.id}" id="account-${account.id}" value="${account.id}">` + 
                    `<label for="account-${account.id}">${account.title}</label>`
            };
        }));
        rightCol.appendChild(accountList);

        Dialog.createDialog([leftCol, rightCol], (): string | void => 
            onconfirm(
                titleInput.value.trim(), 
                urlInput.value.trim(), 
                Array.from(accountList.children)
                    .map((child): HTMLInputElement => child.getElementsByTagName('input')[0])
                    .map((input): {id: number; filtered: boolean} => ({id: Number(input.value), filtered: !input.checked}))
            ));
    }

    /**
     * Creates a dialog with account name, post lists radio and filtered posts checkbox list
     * @param postLists the post lists for selection
     * @param onconfirm the action to perform with the new account information on user confirmation
     */
    public static addAccount(
        postLists: PostList[],
        onconfirm: (title: string, postListId: number, postIds: number[]) => string | void): void {

        Dialog.editAccount('', 0, [], postLists, onconfirm);
    }

    /**
     * Creates a dialog with account name, post lists radio and filtered posts checkbox list
     * @param title the current account name
     * @param postListId the id of the current post list
     * @param filteredPostIds the ids of the currently filtered posts
     * @param postLists the post lists for selection
     * @param onconfirm the action to perform with the new account information on user confirmation
     */
    public static editAccount(
        title: string,
        postListId: number, 
        filteredPostIds: number[],
        postLists: PostList[],
        onconfirm: (title: string, postListId: number, postIds: number[]) => string | void ): void {
        
        const leftCol = document.createElement('div');
        leftCol.setAttribute('class', 'column');
        const rightCol = document.createElement('div');
        rightCol.setAttribute('class', 'column');

        // account title input
        const [titleDiv, titleInput] = this.createInputDiv('title-input', 'Account Titel', title);
        leftCol.appendChild(titleDiv);

        // post lists radio with id as value, current list is checked
        const postListsList = document.createElement('ul');
        View.displayList(postListsList, postLists.map((postList): {id: number; innerHTML: string} => { 
            return {
                id: postList.id,
                innerHTML: `<input type="radio"${postList.id == postListId ? ' checked' : ''} name="post-list" id="post-list-${postList.id}" value="${postList.id}">` + 
                    `<label for="post-list-${postList.id}">${postList.title}</label>`
            };
        }));
        leftCol.appendChild(postListsList);

        // filtered posts checkbox list sorted by post id, all filtered posts are unchecked
        let postList: HTMLUListElement;
        if(postLists.length > 0) {
            postList = document.createElement('ul');
            const posts = postLists[0].posts.concat().sort((a, b): number => a.id - b.id);
            View.displayList(postList, posts.map((post): {id: number; innerHTML: string} => { 
                return {
                    id: post.id,
                    innerHTML: `<input type="checkbox"${filteredPostIds.includes(post.id) ? '' : ' checked'} name="post-${post.id}" id="post-${post.id}" value="${post.id}">` + 
                        `<label for="post-${post.id}">` + 
                        `<a href="${post.url}" target="_blank">Link</a> ${post.title}</label>`
                };
            }));
            rightCol.appendChild(postList);
        }

        // Get all inputted values and call the callback
        Dialog.createDialog([leftCol, rightCol], (): string | void => {
            const title = titleInput.value;
            const checkedInput = Array.from(postListsList.children)
                .map((child): HTMLInputElement => child.getElementsByTagName('input')[0])
                .find((input): boolean => input.checked);
            if(checkedInput) postListId = Number(checkedInput.value);
            let postIds: number[] = [];
            if(postList) postIds = Array.from(postList.children)
                .map((child): HTMLInputElement => child.getElementsByTagName('input')[0])
                .filter((input): boolean => !input.checked)
                .map((input): number => Number(input.value));
            return onconfirm(title.trim(), postListId, postIds);
        });
    }

    /**
     * Shows a list of post list names to edit, when they are not in use.
     * @param postLists all post lists
     * @param inUse indicates that a post list is in use
     * @param onconfirm the action to perform with the new post lists information on user confirmation
     */
    public static editPostLists(
        postLists: PostList[], 
        inUse: boolean[], 
        onconfirm: (titles: string[]) => string | void): void {

        const postListsList = document.createElement('ul');
        for(let i=0; i<postLists.length; i++) {
            const list = postLists[i];
            let div: HTMLDivElement;
            let input: HTMLInputElement;
            if( inUse[i] ) {
                [div, input] = Dialog.createInputDiv(list.id.toString(), 'In Verwendung', list.title);
                input.toggleAttribute('disabled');
            } else {
                [div, input] = Dialog.createInputDiv(list.id.toString(), 'Neuer Titel für ' + list.title, list.title);
            }
            postListsList.appendChild(div);
        }
        const button = document.createElement('button');
        button.innerText = '+';
        button.addEventListener('click', (): void => { 
            const [div] = Dialog.createInputDiv('', 'Neue Post Liste', '');
            button.before(div);
        });
        postListsList.appendChild(button);
        Dialog.createDialog([postListsList], (): string | void => 
            onconfirm(Array.from(postListsList.getElementsByTagName('input')).map((input): string => input.value.trim())));
    }

}