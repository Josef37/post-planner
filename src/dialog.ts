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
        this.createOverlay([textarea], _ => onconfirm(textarea.value.trim()));
    }

    static addPost(onconfirm: (title: string, url: string) => void) {
        Dialog.editPost("", "", onconfirm);
    }

    static editPost(title: string, url: string, onconfirm: (title: string, url: string) => void) {
        let titleLabel = document.createElement("label");
        titleLabel.setAttribute("for", "title-input");
        titleLabel.innerHTML = "Post Titel";
        let titleInput = document.createElement("input");
        titleInput.id = "title-input";
        titleInput.value = title;
        let titleDiv = document.createElement("div");
        titleDiv.className = "container";
        titleDiv.append(titleLabel, titleInput);

        let urlLabel = document.createElement("label");
        urlLabel.setAttribute("for", "url-input");
        urlLabel.innerHTML = "Post URL";
        let urlInput = document.createElement("input");
        urlInput.type = "url";
        urlInput.value = "url-input";
        urlInput.value = url;
        let urlDiv = document.createElement("div");
        urlDiv.className = "container";
        urlDiv.append(urlLabel, urlInput);

        this.createOverlay([titleDiv, urlDiv], _ => onconfirm(titleInput.value, urlInput.value));
    }

}