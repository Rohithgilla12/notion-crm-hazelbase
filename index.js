import {createRequire} from "module";
import {Client} from "@notionhq/client";

const require = createRequire(import.meta.url);

require("dotenv").config();

const NOTION_SECRET_KEY = process.env.NOTION_SECRET_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;


const GRAPHQL_ENDPOINT = "https://api.hazelbase.com/graphql"


const searchQuery = () => `
query SearchV2($email: String) {
  searchV2(email: $email) {
    name {
      first
      last
      full
    }
    addresses {
      city
    }
    phoneAccounts {
      uri
      name
      carrier
      type
    }
    emailAddresses
    profiles {
      network
      url
    }
  }
}
`

const getSearchResults = async (email) => {
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `ApiKey ${process.env.HAZEL_BASE_KEY}`
            },
            body: JSON.stringify({
                query: searchQuery(),
                variables: {email},
            }),
        });
        const {data} = await response.json();

        return data.searchV2;
    } catch (e) {
        return [];
    }
}


const notion = new Client({auth: NOTION_SECRET_KEY});

async function main() {
    try {
        const response = await notion.databases.query({
            database_id: NOTION_DATABASE_ID,
        });


        //iterate over response.results
        for (const result of response.results) {
            const email = result.properties["Email"];
            const name = result.properties["Name"];
            const emailText = email[email.type][0]["plain_text"];
            const isAdded = result.properties["Added"];
            const isAddedBool = isAdded[isAdded.type];
            const linkedIn = result.properties["LinkedIn"];
            const misc = result.properties["Misc"];
            const twitter = result.properties["Twitter"];

            let fullName = "Not Found";
            let linkedInUrl = "Not Found";
            let twitterUrl = "Not Found";
            let miscData = "Not Found";

            if (!isAddedBool) {
                const searchResponse = await getSearchResults(emailText)

                if (searchResponse.length !== 0) {
                    fullName = searchResponse[0].name.full;
                    const linkedInObj = searchResponse[0].profiles.find(
                        (profile) => profile.network === "linkedin"
                    );
                    const twitterObj = searchResponse[0].profiles.find(
                        (profile) => profile.network === "twitter"
                    );
                    if (linkedInObj) {
                        linkedInUrl = linkedInObj.url;
                    }
                    if (twitterObj) {
                        twitterUrl = twitterObj.url;
                    }
                    if (miscData) {
                        miscData = JSON.stringify(
                            {
                                "phoneAccounts": searchResponse[0].phoneAccounts,
                                "addresses": searchResponse[0].addresses,
                                "emailAddresses": searchResponse[0].emailAddresses,
                                "profiles": searchResponse[0].profiles
                            }
                        )
                    }
                }
                const changedResult = {
                    ...result.properties,
                    Twitter: {
                        ...twitter,
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: twitterUrl,
                                    link: twitterUrl !== "Not Found" ? {url: twitterUrl} : null,
                                },
                                plain_text: twitterUrl,
                                href: null,
                            },
                        ],
                    },
                    LinkedIn: {
                        ...linkedIn,
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: linkedInUrl,
                                    link:
                                        linkedInUrl !== "Not Found" ? {url: linkedInUrl} : null,
                                },
                                plain_text: linkedInUrl,
                                href: null,
                            },
                        ],
                    },
                    Misc: {
                        ...misc,
                        rich_text: [
                            {
                                type: "text",
                                text: {content: miscData, link: null},
                                plain_text: miscData,
                                href: null,
                            },
                        ],
                    },
                    Added: {
                        ...isAdded,
                        checkbox: true,
                    },
                    Name: {
                        ...name,
                        title: [
                            {
                                type: "text",
                                text: {content: fullName, link: null},
                                plain_text: fullName,
                                href: null,
                            },
                        ],
                    },
                };

                await notion.pages.update({
                    page_id: result.id,
                    properties: changedResult,
                });
            }
        }
    } catch (error) {
        console.log(error);
    }
    setTimeout(main, 5000);
}

await main();