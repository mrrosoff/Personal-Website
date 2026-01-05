import { DateTime } from "luxon";

type FileType = "-" | "d" | "l";

export type File = {
    type: FileType;
    permissions: string;
    contents: FileSystem | string;
};

export type FileSystem = Record<string, File>;

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
							Hello World! 👋
						`
                    }
                }
            },
            Documents: {
                type: "d",
                permissions: "rwx------",
                contents: {
                    "consultation.txt": {
                        type: "-",
                        permissions: "rwx------",
                        contents: `
                            Looking for something custom made? I might be able to bring your vision to life.
                            Contact me using the links under my profile picture to get started.
                        `
                    },
                    ...(date.month === 3 &&
                        date.day === 14 && {
                        "pi.txt": {
                            type: "-",
                            permissions: "rwx------",
                            contents: `Happy Pi Day! 🥧

Here are the first 100 digits of π:
3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679

Fun fact: π is good to eat!`
                        }
                    }),
                    ...(date.month === 1 &&
                        date.day === 1 && {
                        "newyear.txt": {
                            type: "-",
                            permissions: "rwx------",
                            contents: `🎉 Happy New Year ${date.year}! 🎊`
                        }
                    }),
                }
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
                    ...(date.month === 5 &&
                        date.day === 16 && {
                        "itsMyBirthday.mkv": {
                            type: "-",
                            permissions: "rwx------",
                            contents:
                                "https://www.youtube.com/embed/nYsbt8Fo9Ow?controls=0&controls=0autoplay=1"
                        }
                    }),
                    ...(date.month === 9 &&
                        date.day === 21 && {
                        "isItThatTime.avi": {
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
                contents: {
                    "technology.mp4": {
                        type: "-",
                        permissions: "rwx------",
                        contents: "https://www.youtube.com/embed/kZvE6ESK_wI?controls=0&autoplay=1"
                    }
                }
            }
        }
    }
};

export default files;
