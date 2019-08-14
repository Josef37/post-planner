export class Post {

    // This is used for creating post ids
    public static runningId: number = 0;

    public id: number;
    public title: string;
    public url: string;
    public text: string;


    /**
     * A Post represents one instance of a social media post.
     * @param title The name of the post (not for posting)
     * @param url   The URL that is added to the post text
     * @param text  The actual text you want to post
     * @param id    An id you may only provide when recreating posts
     */
    public constructor(title: string, url: string, text: string = '', id?: number) {
        [this.title, this.url, this.text] = [title, url, text];
        this.id = id === undefined ? Post.runningId++ : id;
    }

    /**
     * @returns the text that actually gets posted (includes the url at the end)
     */
    public getTextForPosting(): string {
        return this.text + '\n' + this.url;
    }

}