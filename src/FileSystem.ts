import { DateTime } from "luxon";

type FileType = "-" | "d" | "l";

interface FileSystem {
    [name: string]: {
        type: FileType;
        permissions: string;
        contents: FileSystem | string;
    };
}

const date = DateTime.now();
const files: FileSystem = {
    "/": {
        type: "d",
        permissions: "rwx------",
        contents: {
            Desktop: {
                type: "d",
                permissions: "rwx------",
                contents: {
                    "README.md": {
                        type: "-",
                        permissions: "rwx------",
                        contents: `
							Hello World!
						`
                    }
                }
            },
            Documents: {
                type: "d",
                permissions: "rwx------",
                contents: {}
            },
            Music: {
                type: "d",
                permissions: "rwx------",
                contents: {
                    "groovy.mov": {
                        type: "-",
                        permissions: "rwx------",
                        contents: "https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0&autoplay=1"
                    },
                    "smooth.mp4": {
                        type: "-",
                        permissions: "rwx------",
                        contents: "https://www.youtube.com/embed/GG7fLOmlhYg?controls=0&autoplay=1"
                    },
                    ...(date.month === 9 &&
                        date.day === 21 && {
                            "isItThatTime.mp4": {
                                type: "-",
                                permissions: "rwx------",
                                contents:
                                    "https://www.youtube.com/embed/Gs069dndIYk?controls=0&controls=0autoplay=1"
                            }
                        })
                }
            },
            Videos: {
                type: "d",
                permissions: "rwx------",
                contents: {}
            }
        }
    }
};

export default files;
