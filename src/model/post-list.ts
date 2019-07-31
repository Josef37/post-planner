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

    putPostLast(post: Post): boolean {
        if(this.removePost(post)) { 
            this.addPost(post);
            return true;
        }
        return false;
    }

    deferPost(post: Post, positions = 10) {
        let index = this.posts.indexOf(post);
        if(index === -1) return false;
        this.posts.splice(index+positions, 0, this.posts.splice(index, 1)[0]);
        return true;
    }

    getPostById(postId: number): Post {
        let filtered = this.posts.filter(post => post.id === postId);
        if(filtered.length === 1) return filtered[0];
        throw "Post not found or ambigous";
    }

}