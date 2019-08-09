import { AccountList } from "./model/account-list";
import { PostList } from "./model/post-list";
import { Post } from "./model/post";
import { PostingAccount } from "./model/posting-account";
import fs from 'fs';

export class Persistence {

    private static snapshotDir = './data/';
    private static maxSnapshots = 100;
    
    private posts: (Post|undefined)[] = [];
    private postsLists: (PostList|undefined)[] = [];
    private accounts: (PostingAccount|undefined)[] = [];

    public constructor(accountList: AccountList) {
        // Store posts, postList and accounts in array with id as index
        accountList.accounts.forEach((account): void => {
            this.accounts[account.id] = account;
            account.postList && (this.postsLists[account.postList.id] = account.postList);
        });
        this.postsLists.forEach((postList): void => 
            postList && postList.posts.forEach((post): void => 
            { this.posts[post.id] = post }));
    }

    public stringify(): string {
        const postsString = '"posts": ' + JSON.stringify(this.posts, undefined, 2);
        // replace post references with id
        const postListsString = '"postLists": ' +
            JSON.stringify(this.postsLists, (_key, value): (number|string) => {
                if(value instanceof Post) {
                    return value.id;
                }
                return value;
            }, 2);
        // replace post and postList references with id
        const accountsString = '"accounts": ' +
            JSON.stringify(this.accounts, (_key, value): (number|string|Post[]) => {
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

    public static parse(persistanceString: string): AccountList {
        const { posts: parsedPosts, postLists: parsedPostLists, accounts: parsedAccounts }: 
        { 
            posts: (undefined | Post)[];
            postLists: (undefined | {id: number; title: string; posts: number[]})[]; 
            accounts: (undefined | {id: number; title: string; currentPost: number; postList: number; filteredPosts: number[]})[]; 
        } 
            = JSON.parse(persistanceString);

        // revive posts (keep empty entries for mapping)
        const posts = parsedPosts.map((post): Post | undefined => {
            if(post) return new Post(post.title, post.url, post.text, post.id);
        });

        // revive postLists (keep empty entries for mapping)
        const postLists: (PostList|undefined)[] = [];
        for(let i=0; i<parsedPostLists.length; i++) {
            const list = parsedPostLists[i];
            if(!list) continue;
            postLists[i] = new PostList(
                list.title,
                list.posts.map((postId): (Post|undefined) => posts[postId])
                    .filter((post): (Post|undefined) => post) as Post[],
                list.id
            );
        }

        // revive accounts (remove empty entries)
        const accounts: PostingAccount[] = [];
        for (let i = 0; i < parsedAccounts.length; i++) {
            const account = parsedAccounts[i];
            if(!account) continue;
            accounts.push(new PostingAccount(
                account.title,
                postLists[account.postList],
                new Set(account.filteredPosts
                    .map((postId): (Post|undefined) => posts[postId])
                    .filter((post): (Post|undefined) => post) as Post[]),
                account.id
            ));
        }

        // get maximum ids for consistent numbering
        Post.runningId = 1 + Persistence.getMaxId(posts);
        PostList.runningId = 1 + Persistence.getMaxId(postLists);
        PostingAccount.runningId = 1 + Persistence.getMaxId(accounts);

        return new AccountList(accounts, postLists.filter((list): PostList|undefined => list) as PostList[]);
    }

    public save(): void {
        const json = this.stringify();
        const dateString = new Date().toISOString().replace(/[.:]/g, '-');
        fs.writeFileSync(Persistence.snapshotDir + `snapshot-${dateString}.json`, json, 'utf-8');
        // delete too many snapshots
        const snapshots = Persistence.getSnapshots();
        if(snapshots.length > Persistence.maxSnapshots) {
            const oldestSnapshot = snapshots[snapshots.length-1];
            fs.unlinkSync(oldestSnapshot);
        }
        // delete all redo files
        Persistence.getSnapshots('redo').forEach((redo): void => fs.unlinkSync(redo));
    }

    public static load(): AccountList {
        const latestSnapshot = Persistence.getLatestSnapshot();
        const data = fs.readFileSync(latestSnapshot, 'utf-8');
        return Persistence.parse(data);
    }

    public static undo(): AccountList {
        const latestSnapshot = Persistence.getLatestSnapshot();
        const data = fs.readFileSync(latestSnapshot, 'utf-8');
        fs.renameSync(latestSnapshot, latestSnapshot.replace("snapshot", "redo"));
        return Persistence.parse(data);
    }

    public static redo(): AccountList {
        const redos = Persistence.getSnapshots('redo');
        if(redos.length == 0) throw "No redos found";
        const oldestRedo = redos[redos.length-1]; // TODO: Clean Redo History when doing next step or get consecutive redo
        const data = fs.readFileSync(oldestRedo, 'utf-8');
        fs.renameSync(oldestRedo, oldestRedo.replace('redo', 'snapshot'));
        return Persistence.parse(data);
    }

    private static getLatestSnapshot(): string {
        const snapshots = Persistence.getSnapshots();
        if(snapshots.length == 0) throw "No snapshot found";
        return snapshots[0];
    }

    private static getSnapshots(startsWith = 'snapshot'): string[] {
        const files = fs.readdirSync(Persistence.snapshotDir);
        return files.filter((filename): boolean => filename.startsWith(startsWith) && filename.endsWith('.json'))
            .map((filename): string => Persistence.snapshotDir + filename).sort().reverse();
    }

    private static getMaxId(arr: (undefined|{id: number})[]): number {
        return (arr.filter((element): (undefined|{id: number}) => element) as {id: number}[])
            .map((element): number => element.id)
            .reduce((maxId, id): number => Math.max(maxId, id));
    }
}