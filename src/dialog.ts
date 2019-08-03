import { PostList } from "./model/post-list";
import { View } from "./view";

export class Dialog {
    
    static createOverlay(nodes: (string | Node)[], onconfirm?: (_: any) => any) {
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
        cancel.addEventListener("click", _ => document.body.removeChild(overlay));
        buttonRow.appendChild(cancel);

        let confirm = document.createElement("button");
        confirm.innerText = "Übernehmen";
        confirm.type = "button";
        confirm.addEventListener("click", _ => document.body.removeChild(overlay));
        if(onconfirm) confirm.addEventListener("click", onconfirm);
        buttonRow.appendChild(confirm);
    }

    static editPostText(postText: string, onconfirm: (newPostText: string) => void) {
        let textarea = document.createElement("textarea");
        textarea.value = postText;
        Dialog.createOverlay([textarea], _ => onconfirm(textarea.value.trim()));
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

        Dialog.createOverlay([titleDiv, urlDiv], _ => onconfirm(titleInput.value, urlInput.value));
    }

    static addAccount(postLists: PostList[], onconfirm: (title: string, postListId: number, postIds: number[]) => void) {
        let leftCol = document.createElement("div");
        leftCol.setAttribute("class", "column");
        let rightCol = document.createElement("div");
        rightCol.setAttribute("class", "column");

        let [titleDiv, titleInput] = this.createInputDiv("title-input", "Account Titel", "");
        leftCol.appendChild(titleDiv);

        let postListsList = document.createElement("ul");
        View.displayList(postListsList, postLists.map(postList => { 
            return {
                id: postList.id,
                innerHTML: `<input type="radio" name="post-list" id="post-list-${postList.id}" value="${postList.id}">` + 
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
                    innerHTML: `<input type="checkbox" checked name="post-${post.id}" id="post-${post.id}" value="${post.id}">` + 
                        `<label for="post-${post.id}">` + 
                        `<a href="${post.url}" target="_blank">Link</a> ${post.title}</label>`
                };
            }));
            rightCol.appendChild(postList);
        }

        Dialog.createOverlay([leftCol, rightCol], _ => {
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
            onconfirm(title, postListId, postIds);
        });
    }

}