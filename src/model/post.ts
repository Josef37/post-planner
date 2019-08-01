export class Post {

    //TODO: Change to biggest id on startup
    static runningId: number = 0;

    id: number;
    title: string;
    url: string;
    text: string;

    constructor() {}

    init(title: string, url: string, text = ""): Post {
        this.id = Post.runningId++;
        [this.title, this.url, this.text] = [title, url, text];
        return this;
    }

    static fromJSON({id, title, url, text}): Post {
        let post = new Post();
        post.id = id;
        post.title = title;
        post.url = url;
        post.text = text;
        return post;
    }

    getTextForPosting() {
        return this.text + '\n\n' + this.url;
    }

}