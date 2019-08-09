import { PostList } from './model/post-list';
import { View } from './view';

export class Dialog {
    
    private static createOverlay(nodes: (string | Node)[], onconfirm?: () => void): void {
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
        confirm.addEventListener('click', (): void => { document.body.removeChild(overlay) });
        if(onconfirm) confirm.addEventListener('click', onconfirm);
        buttonRow.appendChild(confirm);
    }

    public static confirm(question: string, onconfirm: () => void): void {
        Dialog.createOverlay([question], onconfirm);
    }

    public static editPostText(postText: string, onconfirm: (newPostText: string) => void): void {
        const textarea = document.createElement('textarea');
        textarea.value = postText;
        Dialog.createOverlay([textarea], (): void => onconfirm(textarea.value.trim()));
    }

    public static addPost(onconfirm: (title: string, url: string) => void): void {
        Dialog.editPost('', '', onconfirm);
    }

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

    public static editPost(title: string, url: string, onconfirm: (title: string, url: string) => void): void {
        const [titleDiv, titleInput] = this.createInputDiv('title-input', 'Post Titel', title);
        const [urlDiv, urlInput] = this.createInputDiv('url-input', 'Post URL', url, 'url');

        Dialog.createOverlay([titleDiv, urlDiv], (): void => onconfirm(titleInput.value.trim(), urlInput.value.trim()));
    }

    public static addAccount(postLists: PostList[], onconfirm: (title: string, postListId: number, postIds: number[]) => void): void {
        Dialog.editAccount('', 0, [], postLists, onconfirm);
    }

    public static editAccount(
        title: string,
        postListId: number, 
        filteredPostIds: number[],
        postLists: PostList[],
        onconfirm: (title: string, postListId: number, postIds: number[]) => void ): void {
        
        const leftCol = document.createElement('div');
        leftCol.setAttribute('class', 'column');
        const rightCol = document.createElement('div');
        rightCol.setAttribute('class', 'column');

        const [titleDiv, titleInput] = this.createInputDiv('title-input', 'Account Titel', title);
        leftCol.appendChild(titleDiv);

        const postListsList = document.createElement('ul');
        View.displayList(postListsList, postLists.map((postList): {id: number; innerHTML: string} => { 
            return {
                id: postList.id,
                innerHTML: `<input type="radio"${postList.id == postListId ? ' checked' : ''} name="post-list" id="post-list-${postList.id}" value="${postList.id}">` + 
                    `<label for="post-list-${postList.id}">${postList.title}</label>`
            };
        }));
        leftCol.appendChild(postListsList);

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

        Dialog.createOverlay([leftCol, rightCol], (): void => {
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
            onconfirm(title.trim(), postListId, postIds);
        });
    }

    public static editPostLists(postLists: PostList[], inUse: boolean[], onconfirm: (titles: string[]) => void): void {
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
        Dialog.createOverlay([postListsList], (): void => 
            onconfirm(Array.from(postListsList.getElementsByTagName('input')).map((input): string => input.value.trim())));
    }

}