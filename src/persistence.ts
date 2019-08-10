import fs from 'fs';
import { AccountList } from './model/account-list';
import { Post } from './model/post';
import { PostList } from './model/post-list';
import { PostingAccount } from './model/posting-account';

export class Persistence {

    private static snapshotDir = './data/';
    private static maxSnapshots = 100;
    
    private posts: (Post | undefined)[] = [];
    private postLists: (PostList | undefined)[] = [];
    private accounts: (PostingAccount | undefined)[] = [];

    /**
     * Creates arrays of all posts, post lists and accounts, 
     * where the array position is the elements id.
     * @param accountList The data to persist
     */
    public constructor(accountList: AccountList) {
        accountList.accounts.forEach((account): void => {
            this.accounts[account.id] = account;
            account.postList && (this.postLists[account.postList.id] = account.postList);
        });
        this.postLists.forEach((postList): void => 
            postList && postList.posts.forEach((post): void => 
            { this.posts[post.id] = post }));
    }

    /**
     * Creates a JSON string from the posts, postLists and accounts.
     * References to posts and post lists are replaced by their id.
     * The array position represents the id.
     * @returns '{ "posts": [...], "postLists": [...], "accounts": [...] }' with replaced references
     */
    public stringify(): string {
        const postsString = '"posts": ' + JSON.stringify(this.posts, undefined, 2);

        // replace post references with id
        const postListsString = '"postLists": ' +
            JSON.stringify(this.postLists, (_key, value): (number | string) => {
                if(value instanceof Post) {
                    return value.id;
                }
                return value;
            }, 2);

        // replace post and postList references with id
        const accountsString = '"accounts": ' +
            JSON.stringify(this.accounts, (_key, value): (number | string | Post[]) => {
                if(value instanceof PostList || value instanceof Post) {
                    return value.id;
                } else if (value instanceof Set) {
                    return Array.from(value);
                }
                return value;
            }, 2);

        return `{\n${postsString},\n${postListsString},\n${accountsString}\n}`
    }

    /**
     * Revives the objects from JSON.
     * References have to be replaced by their id.
     * The array position represents the id.
     * @param persistanceString '{ "posts": [...], "postLists": [...], "accounts": [...] }' with replaced references
     */
    public static parse(persistanceString: string): AccountList {
        const { posts: parsedPosts, postLists: parsedPostLists, accounts: parsedAccounts }: 
        { 
            posts: (null | Post)[];
            postLists: (null | {id: number; title: string; posts: number[]})[]; 
            accounts: (null | {id: number; title: string; currentPost: number; postList: number; filteredPosts: number[]})[]; 
        } 
            = JSON.parse(persistanceString);

        // revive posts (keep empty entries for mapping)
        const posts = parsedPosts.map((post): Post | null => 
            post && new Post(post.title, post.url, post.text, post.id)
        );

        // revive postLists, set post references (keep empty entries for mapping)
        const postLists: (PostList | null)[] = [];
        for(let i=0; i<parsedPostLists.length; i++) {
            const list = parsedPostLists[i];
            if(!list) continue;
            postLists[i] = new PostList(
                list.title,
                list.posts.map((postId): (Post | null) => posts[postId])
                    .filter((post): (Post | null) => post) as Post[],
                list.id
            );
        }

        // revive accounts, set post list and post references (remove empty entries)
        const accounts: PostingAccount[] = [];
        for (let i = 0; i < parsedAccounts.length; i++) {
            const account = parsedAccounts[i];
            if(!account) continue;
            accounts.push(new PostingAccount(
                account.title,
                postLists[account.postList],
                new Set(account.filteredPosts
                    .map((postId): (Post | null) => posts[postId])
                    .filter((post): (Post | null) => post) as Post[]),
                account.id
            ));
        }

        // get maximum ids for consistent numbering
        Post.runningId = 1 + Persistence.getMaxId(posts);
        PostList.runningId = 1 + Persistence.getMaxId(postLists);
        PostingAccount.runningId = 1 + Persistence.getMaxId(accounts);

        return new AccountList(accounts, postLists.filter((list): PostList | null => list) as PostList[]);
    }

    /**
     * Saves the Persistance Object as `snapshot-${date}`.
     * Deletes too many files (maxSnapshots) and all redo points, 
     * so a new save makes it impossible to redo undone things.
     */
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


    /**
     * Loads and parses the latest snapshot.
     * @returns the recreated account list
     */
    public static load(): AccountList {
        const latestSnapshot = Persistence.getLatestSnapshot();
        const data = fs.readFileSync(latestSnapshot, 'utf-8');
        return Persistence.parse(data);
    }

    /**
     * Loads and parses the latest snapshot.
     * Renames it from 'snapshot' to 'redo'.
     * @returns the recreated account list
     */
    public static undo(): AccountList {
        const latestSnapshot = Persistence.getLatestSnapshot();
        const data = fs.readFileSync(latestSnapshot, 'utf-8');
        fs.renameSync(latestSnapshot, latestSnapshot.replace('snapshot', 'redo'));
        return Persistence.parse(data);
    }

    /**
     * Loads and parses the oldest redo point.
     * Renames it from 'redo' to 'snapshot'.
     * @returns the recreated account list
     */
    public static redo(): AccountList {
        const redos = Persistence.getSnapshots('redo');
        if(redos.length == 0) throw new Error('No redos found');
        const oldestRedo = redos[redos.length-1];
        const data = fs.readFileSync(oldestRedo, 'utf-8');
        fs.renameSync(oldestRedo, oldestRedo.replace('redo', 'snapshot'));
        return Persistence.parse(data);
    }

    /**
     * Get the latest snapshot
     * @returns the relative path to the latest snapshot
     */
    private static getLatestSnapshot(): string {
        const snapshots = Persistence.getSnapshots();
        if(snapshots.length == 0) throw new Error('No snapshot found');
        return snapshots[0];
    }

    /**
     * Sorts the paths to all files beginning with startsWith and ending with .json
     * @param startsWith the beginning of the file name
     * @returns an array of all relative paths sorted from latest to oldest
     */
    private static getSnapshots(startsWith = 'snapshot'): string[] {
        const files = fs.readdirSync(Persistence.snapshotDir);
        return files.filter((filename): boolean => filename.startsWith(startsWith) && filename.endsWith('.json'))
            .map((filename): string => Persistence.snapshotDir + filename).sort().reverse();
    }

    /**
     * Determines the maximum non-negative id of all given elements
     * @param arr the elements with an id
     * @returns the maximum id of all the elements, or -1 if there is none
     */
    private static getMaxId(arr: (null | {id: number})[]): number {
        return (arr.filter((element): (null | {id: number}) => element) as {id: number}[])
            .map((element): number => element.id)
            .reduce((maxId, id): number => Math.max(maxId, id), -1);
    }
}