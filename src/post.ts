class Post {

    //TODO: Change to biggest id on startup
    static runningId: number = 0;

    id: number;

    constructor(public title: string, 
                public url: string, 
                public text = "") {
        this.id = Post.runningId++;
    }

}