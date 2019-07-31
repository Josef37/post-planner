class PostList {
    posts: Post[] = [];

    addPost(post: Post): void {
        this.posts.push(post);
    }

    // remove post and retrun if successful
    removePost(post: Post): boolean {
        let index = this.posts.indexOf(post);
        if(index === -1) return false;
        this.posts.splice(index, 1);
        return true;
    }

    putPostLast(post: Post) {
        if(this.removePost(post)) this.addPost(post);
    }
}