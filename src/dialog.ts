export class Dialog {

    overlay: HTMLDivElement;

    createOverlay() {
        this.overlay = document.createElement("div");
        this.overlay.className = "overlay";
        document.body.appendChild(this.overlay);

        let dialog = document.createElement("form");
        dialog.className = "dialog";
        this.overlay.appendChild(dialog);

        let buttonRow = document.createElement("div");
        buttonRow.className = "button-row";
        dialog.appendChild(buttonRow);

        let cancel = document.createElement("button");
        cancel.innerText = "Abbrechen";
        cancel.type = "button";
        buttonRow.appendChild(cancel);

        let confirm = document.createElement("button");
        confirm.innerText = "OK";
        confirm.type = "button";
        buttonRow.appendChild(confirm);
    }

    removeOverlay() {
        document.body.removeChild(this.overlay);
    }
}