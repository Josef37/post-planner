class PostingAccount {

    //TODO: How?
    static runningId: number = 0;

    id: number;
    currentPost: Post | null = null;

    constructor(public title: string,
                public postList: PostList, 
                public filteredPosts = new Set()) {
        this.id = PostingAccount.runningId++;
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

    setTitle(title: string) { this.title = title; }
    getTitle() { return this.title; }

    getCurrentPost() { 
        return this.currentPost; 
    }
    
    setCurrentPost(post: Post | null) { 
        this.currentPost = post;
    }

}