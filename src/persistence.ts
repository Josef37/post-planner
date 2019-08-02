import { AccountList } from "./model/account-list";
import { PostList } from "./model/post-list";
import { Post } from "./model/post";
import { PostingAccount } from "./model/posting-account";
import fs from 'fs';

export class Persistence {

    static snapshotDir = './data/';
    static maxSnapshots = Number.MAX_VALUE;
    
    posts: Post[] = [];
    postsLists: PostList[] = [];
    accounts: PostingAccount[] = [];

    constructor(public accountList: AccountList) {
        // Store posts, postList and accounts in array with id as index
        accountList.accounts.forEach(account => {
            this.accounts[account.id] = account;
            this.postsLists[account.postList.id] = account.postList;
        });
        this.postsLists.forEach(postList => postList.posts.forEach(post => this.posts[post.id] = post));
    }

    stringify(): string {
        let postsString = '"posts": ' + JSON.stringify(this.posts, undefined, 2);
        // replace post references with id
        let postListsString = '"postLists": ' +
            JSON.stringify(this.postsLists, (key, value) => {
                if(value instanceof Post) {
                    return value.id;
                }
                return value;
            }, 2);
        // replace post and postList references with id
        let accountsString = '"accounts": ' +
            JSON.stringify(this.accounts, (key, value) => {
                if(value instanceof PostList || value instanceof Post) {
                    return value.id;
                } else if (value instanceof Set) {
                    return Array.from(value);
                }
                return value;
            }, 2);
        return '{\n' + postsString +
            ',\n' + postListsString +
            ',\n'+ accountsString + 
            '\n}';
    }

    static parse(persistanceString: string): AccountList {
        let { posts, postLists, accounts } = JSON.parse(persistanceString);

        // revive posts (keep empty entries for mapping)
        posts = posts.map(post => {if(post) return Post.fromJSON(post)});

        // set post references in postList
        postLists.filter(list => list).forEach(list => {
            list.posts = list.posts.map(postId => posts[postId]);
        });
        // revive postLists (keep empty entries for mapping)
        postLists = postLists.map(list => {
            if(list) return PostList.fromJSON(list);
        });

        accounts = accounts.filter(account => account);
        // set post and postList references in accounts
        accounts.forEach(account => {
            account.postList = postLists[account.postList];
            account.filteredPosts = new Set(
                account.filteredPosts.map(postId => posts[postId])
            );
        });
        // revive accounts
        accounts = accounts.map(account => PostingAccount.fromJSON(account));

        // get maximum ids for consistent numbering
        Post.runningId = 1 + Persistence.getMaxId(posts);
        PostList.runningId = 1 + Persistence.getMaxId(postLists);
        PostingAccount.runningId = 1 + Persistence.getMaxId(accounts);

        return new AccountList(accounts, postLists.filter(list => list));
    }

    save() {
        let json = this.stringify();
        let dateString = new Date().toISOString().replace(/[.:]/g, '-');
        fs.writeFileSync(Persistence.snapshotDir + `snapshot-${dateString}.json`, json, 'utf-8');
        let snapshots = Persistence.getSnapshots();
        if(snapshots.length > Persistence.maxSnapshots) {
            let oldestSnapshot = snapshots[snapshots.length-1];
            fs.unlinkSync(oldestSnapshot);
        }
    }

    static load(): AccountList {
        let latestSnapshot = Persistence.getLatestSnapshot();
        let data = fs.readFileSync(latestSnapshot, 'utf-8');
        return Persistence.parse(data);
    }

    static undo(): AccountList {
        let latestSnapshot = Persistence.getLatestSnapshot();
        let data = fs.readFileSync(latestSnapshot, 'utf-8');
        fs.unlinkSync(latestSnapshot);
        return Persistence.parse(data);
    }

    static getLatestSnapshot(): string {
        let snapshots = Persistence.getSnapshots();
        if(snapshots.length == 0) throw "No snapshot found";
        return snapshots[0];
    }

    static getSnapshots(): string[] {
        let files = fs.readdirSync(Persistence.snapshotDir);
        return files.filter(filename => filename.startsWith('snapshot') && filename.endsWith('.json'))
            .map(filename => Persistence.snapshotDir+filename).sort().reverse();
    }

    static getMaxId(arr: {id: number}[]): number {
        return arr.filter(element => element).map(element => element.id).reduce((maxId, id) => Math.max(maxId, id));
    }
}