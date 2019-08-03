import { PostList } from "./model/post-list";
import { View } from "./view";

export class Dialog {
    
    static createOverlay(nodes: (string | Node)[], onconfirm?: () => any) {
        let overlay = document.createElement("div");
        overlay.className = "overlay";
        document.body.appendChild(overlay);

        let dialog = document.createElement("div");
        dialog.className = "dialog";
        overlay.appendChild(dialog);

        dialog.append(...nodes);

        let buttonRow = document.createElement("div");
        buttonRow.className = "button-row";
        dialog.appendChild(buttonRow);

        let cancel = document.createElement("button");
        cancel.innerText = "Abbrechen";
        cancel.type = "button";
        cancel.addEventListener("click", () => document.body.removeChild(overlay));
        buttonRow.appendChild(cancel);

        let confirm = document.createElement("button");
        confirm.innerText = "Übernehmen";
        confirm.type = "button";
        confirm.addEventListener("click", () => document.body.removeChild(overlay));
        if(onconfirm) confirm.addEventListener("click", onconfirm);
        buttonRow.appendChild(confirm);
    }

    static confirm(question: string, onconfirm: () => any) {
        Dialog.createOverlay([question], onconfirm);
    }

    static editPostText(postText: string, onconfirm: (newPostText: string) => void) {
        let textarea = document.createElement("textarea");
        textarea.value = postText;
        Dialog.createOverlay([textarea], () => onconfirm(textarea.value.trim()));
    }

    static addPost(onconfirm: (title: string, url: string) => void) {
        Dialog.editPost("", "", onconfirm);
    }

    static createInputDiv(id: string, labelHTML: string, inputValue: string, inputType: string = "text"): [HTMLDivElement, HTMLInputElement] {
        let label = document.createElement("label");
        label.setAttribute("for", id);
        label.setAttribute("class", "text-input-label");
        label.innerHTML = labelHTML;
        let input = document.createElement("input");
        input.id = id;
        input.value = inputValue;
        input.type = inputType;
        let div = document.createElement("div");
        div.className = "container";
        div.append(label, input);
        return [div, input];
    }

    static editPost(title: string, url: string, onconfirm: (title: string, url: string) => void) {
        let [titleDiv, titleInput] = this.createInputDiv("title-input", "Post Titel", title);
        let [urlDiv, urlInput] = this.createInputDiv("url-input", "Post URL", url, "url");

        Dialog.createOverlay([titleDiv, urlDiv], () => onconfirm(titleInput.value.trim(), urlInput.value.trim()));
    }

    static addAccount(postLists: PostList[], onconfirm: (title: string, postListId: number, postIds: number[]) => void) {
        Dialog.editAccount("", 0, [], postLists, onconfirm);
    }

    static editAccount(
        title: string,
        postListId: number, 
        filteredPostIds: number[],
        postLists: PostList[],
        onconfirm: (title: string, postListId: number, postIds: number[]) => void ) {
        
        let leftCol = document.createElement("div");
        leftCol.setAttribute("class", "column");
        let rightCol = document.createElement("div");
        rightCol.setAttribute("class", "column");

        let [titleDiv, titleInput] = this.createInputDiv("title-input", "Account Titel", title);
        leftCol.appendChild(titleDiv);

        let postListsList = document.createElement("ul");
        View.displayList(postListsList, postLists.map(postList => { 
            return {
                id: postList.id,
                innerHTML: `<input type="radio"${postList.id == postListId ? ' checked' : ''} name="post-list" id="post-list-${postList.id}" value="${postList.id}">` + 
                    `<label for="post-list-${postList.id}">${postList.title}</label>`
            };
        }));
        leftCol.appendChild(postListsList);

        let postList: HTMLUListElement;
        if(postLists.length > 0) {
            postList = document.createElement("ul");
            let posts = postLists[0].posts.concat().sort((a, b) => a.id - b.id);
            View.displayList(postList, posts.map(post => { 
                return {
                    id: post.id,
                    innerHTML: `<input type="checkbox"${filteredPostIds.includes(post.id) ? '' : ' checked'} name="post-${post.id}" id="post-${post.id}" value="${post.id}">` + 
                        `<label for="post-${post.id}">` + 
                        `<a href="${post.url}" target="_blank">Link</a> ${post.title}</label>`
                };
            }));
            rightCol.appendChild(postList);
        }

        Dialog.createOverlay([leftCol, rightCol], () => {
            let title = titleInput.value;
            let postListId = Number(Array.from(postListsList.children)
                .map(child => child.getElementsByTagName("input")[0])
                .find(input => input.checked)
                .value);
            let postIds = [];
            if(postList) postIds = Array.from(postList.children)
                .map(child => child.getElementsByTagName("input")[0])
                .filter(input => !input.checked)
                .map(input => Number(input.value));
            onconfirm(title.trim(), postListId, postIds);
        });
    }

    static editPostLists(postLists: PostList[], inUse: boolean[], onconfirm: (titles: string[]) => void) {
        let postListsList = document.createElement("ul");
        for(let i=0; i<postLists.length; i++) {
            let list = postLists[i];
            let listItem = document.createElement("li");
            let [div, input] = [undefined, undefined];
            if( inUse[i] ) {
                [div, input] = Dialog.createInputDiv(list.id.toString(), 'In Verwendung', list.title);
                input.toggleAttribute("disabled");
            } else {
                [div, input] = Dialog.createInputDiv(list.id.toString(), 'Neuer Titel für ' + list.title, list.title);
            }
            listItem.appendChild(div);
            postListsList.appendChild(listItem);
        }
        let button = document.createElement("button");
        button.innerText = '+';
        button.addEventListener("click", () => { 
            let listItem = document.createElement("li");
            let [div, input] = Dialog.createInputDiv("", 'Neue Post Liste', "");
            listItem.appendChild(div);
            button.before(listItem);
        });
        postListsList.appendChild(button);
        Dialog.createOverlay([postListsList], () => onconfirm(Array.from(postListsList.getElementsByTagName("input")).map(input => input.value.trim())));
    }

}