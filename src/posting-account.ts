class PostingAccount {

    constructor(public name: string,
                public postList: PostList, 
                public filteredPosts = new Set()) {
    }

    addPost(post: Post) {
        this.postList.addPost(post);
    }

    removePost(post: Post) {
        return this.postList.removePost(post);
    }

    filterPost(post: Post) {
        this.filteredPosts.add(post);
    }

    unfilterPost(post: Post) {
        this.filteredPosts.delete(post);
    }

    getPostsFiltered(): Post[] {
        return this.postList.posts.filter(post => !this.filteredPosts.has(post));
    }

    setName(name: string) { this.name = name; }
    getName() { return this.name; }

}