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
        let titleInput = document.createElement("input");
        let urlInput = document.createElement("input");
        urlInput.type = "url";
        this.createOverlay([titleInput, urlInput], _ => onconfirm(titleInput.value, urlInput.value));
    }
}