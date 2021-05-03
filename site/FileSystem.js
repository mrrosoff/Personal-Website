export const files = {
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
							Welcome To My Website!
						
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
				contents: {}
			},
			Videos: {
				type: "d",
				permissions: "rwx------",
				contents: {}
			}
		}
	}
};