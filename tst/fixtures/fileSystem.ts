import type { Directory, FileSystem, RegularFile } from "../../../site/FileSystem";

export function mockFile(contents: string): RegularFile {
    return { type: "-", permissions: "rwx------", contents };
}

export function mockDirectory(contents: FileSystem = {}): Directory {
    return { type: "d", permissions: "rwx------", contents };
}

export function mockFileSystem(): FileSystem {
    return {
        "/": mockDirectory({
            home: mockDirectory({
                "fruit.txt": mockFile("banana\napple\napple\ncherry"),
                "other.txt": mockFile("banana\npear\napple\ncherry"),
                "numbers.txt": mockFile("10\n2\n33"),
                "people.csv": mockFile("ada,lovelace,1815\nalan,turing,1912"),
                ".secret": mockFile("shh"),
                projects: mockDirectory({ "site.ts": mockFile("code") })
            }),
            media: mockDirectory({
                "song.mp3": mockFile("https://example.com/song"),
                "photo.png": mockFile("https://example.com/photo.png")
            }),
            empty: mockDirectory()
        })
    };
}
