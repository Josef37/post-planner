export class Dialog {

    overlay: HTMLDivElement;

    createOverlay() {
        this.overlay = document.createElement("div");
        this.overlay.className = "overlay";
        document.body.appendChild(this.overlay);

        let dialog = document.createElement("div");
        dialog.className = "dialog";
        this.overlay.appendChild(dialog);
    }

    removeOverlay() {
        document.body.removeChild(this.overlay);
    }
}