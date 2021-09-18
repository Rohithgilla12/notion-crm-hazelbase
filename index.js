import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { Client } from "@notionhq/client";

const kelvinSDK = require("api")("@kelvin-data/v1.0#3bettnkt7yytde");
require("dotenv").config();

const NOTION_SECRET_KEY = process.env.NOTION_SECRET_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

kelvinSDK.auth(process.env.KELVIN_DATA_KEY);

const notion = new Client({ auth: process.env.NOTION_SECRET_KEY });

async function main() {
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
      console.log(email);
      console.log(email["rich_text"]);
      console.log(result.properties);
      if (!isAddedBool) {
        // const searchResponse = await kelvinSDK["searchV2_query"]({
        //   email: emailText,
        // });
        const searchResponse = [];
        if (searchResponse.length !== 0) {
          //add to notion
        } else {
          // add to notion with not found as values
          var changedResult = {
            ...result.properties,
            LinkedIn: {
              ...linkedIn,
              rich_text: [
                {
                  type: "text",
                  text: { content: "Not Found", link: null },
                  plain_text: "Not Found",
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
    });
  } catch (error) {
    console.log(error);
  }
}

main();
