import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { Client } from "@notionhq/client";

const kelvinSDK = require("api")("@kelvin-data/v1.0#3bettnkt7yytde");
require("dotenv").config();

const NOTION_SECRET_KEY = process.env.NOTION_SECRET_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

kelvinSDK.auth(process.env.KELVIN_DATA_KEY);

const sampleResponse = require("./response.json");

const notion = new Client({ auth: NOTION_SECRET_KEY });

async function main() {
  console.log("Running the Function");
  try {
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
    });
    //iterate over response.results
    response.results.forEach(async (result) => {
      const email = result.properties["Email"];
      const name = result.properties["Name"];
      const emailText = email[email.type][0]["plain_text"];
      const isAdded = result.properties["Added"];
      const isAddedBool = isAdded[isAdded.type];
      const linkedIn = result.properties["LinkedIn"];
      const misc = result.properties["Misc"];
      const twitter = result.properties["Twitter"];

      var fullName = "Not Found";
      var linkedInUrl = "Not Found";
      var twitterUrl = "Not Found";
      var miscData = "Not Found";
      if (!isAddedBool) {
        const searchResponse = await kelvinSDK["searchV2_query"]({
          email: emailText,
          limit: 1,
        });
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
        }
        var changedResult = {
          ...result.properties,
          Twitter: {
            ...twitter,
            rich_text: [
              {
                type: "text",
                text: {
                  content: twitterUrl,
                  link: twitterUrl !== "Not Found" ? { url: twitterUrl } : null,
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
                    linkedInUrl !== "Not Found" ? { url: linkedInUrl } : null,
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
                text: { content: "Nothing", link: null },
                plain_text: "Nothing",
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
                text: { content: fullName, link: null },
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
    });
  } catch (error) {
    console.log(error);
  }
  setTimeout(main, 5000);
}

main();
