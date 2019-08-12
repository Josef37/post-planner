import { Post } from './post';

export class PostList {
    
    // This is used for creating PostList ids
    public static runningId: number = 0;

    public id: number;
    public title: string;
    public posts: Post[];

    /**
     * A PostList just orders posts
     * @param title The name of the list
     * @param posts The posts in the list
     * @param id    An id you may only provide when recreating the list
     */
    public constructor(title: string, posts: Post[] = [], id?: number) {
        [this.title, this.posts] = [title, posts];
        this.id = id === undefined ? PostList.runningId++ : id;
    }

    /**
     * Adds a post to the start of the list
     * @param post The post to add
     */
    public addPost(post: Post): void {
        this.posts.unshift(post);
    }

    /**
     * Remove the post from the list
     * @param post the post to remove, if contained in list
     * @returns    if the removal was successful
     */
    public removePost(post: Post): boolean {
        const index = this.posts.indexOf(post);
        if(index === -1) return false;
        this.posts.splice(index, 1);
        return true;
    }

    /**
     * Puts a post to the end of the list
     * @param post  the post to move to the end, if contained in list
     * @returns     if the operation was successful
     */
    public putPostLast(post: Post): boolean {
        if(this.removePost(post)) { 
            this.posts.push(post);
            return true;
        }
        return false;
    }

    /**
     * Moves a post a few positions back (10 by default)
     * @param post      the post to defer, if contained in list
     * @param positions how many positions to defer
     * @returns         if the operation was successful       
     */
    public deferPost(post: Post, positions = 10): boolean {
        const index = this.posts.indexOf(post);
        if(index === -1) return false;
        this.posts.splice(index+positions, 0, this.posts.splice(index, 1)[0]);
        return true;
    }

    /**
     * Finds a post by id
     * @param postId the id of the post to find
     * @returns      the post with the id or undefined, if it wasn't found
     */
    public getPostById(postId: number): Post | undefined {
        return this.posts.find((post): boolean => post.id === postId);
    }

    /**
     * Copies a post list with a new title
     */
    public copy(title: string): PostList {
        return new PostList(title, Array.from(this.posts));
    }

}