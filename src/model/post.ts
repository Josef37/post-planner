export class Post {

    //TODO: Change to biggest id on startup
    public static runningId: number = 0;

    public id: number = -1;
    public title: string = "";
    public url: string = "";
    public text: string = "";

    public constructor() {}

    public init(title: string, url: string, text = ""): Post {
        this.id = Post.runningId++;
        [this.title, this.url, this.text] = [title, url, text];
        return this;
    }

    public static fromJSON({id, title, url, text}: {id: number; title: string; url: string; text: string}): Post {
        const post = new Post();
        post.id = id;
        post.title = title;
        post.url = url;
        post.text = text;
        return post;
    }

    public getTextForPosting(): string {
        return this.text + '\n\n' + this.url;
    }

}