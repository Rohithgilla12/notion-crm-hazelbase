# Automate your personal CRM with Notion and Kelvin Data

## Introduction

Notion gives an enormous possibilities of what we can do with a single application and honestly one it's of the best way to manage your personal CRM.

Now what if there is a way to try fetching the details from online for fields like, twitter id, Linkedin url, name and few other details just by giving in a user email address.

Feels amazing right?

Meet [Kelvin Data](https://www.kelvindata.com/), it's an API as a service where developers can access millions of people data with API.

### Pre-requisites

- Basic JavaScript
- Node JS
- Notion Account
- Kelvin Data account

### What will we be building

![https://i.imgur.com/6JzIGJq.png](https://i.imgur.com/6JzIGJq.png)

![https://p-843661.f1.n0.cdn.getcloudapp.com/items/YEuObYbQ/7bde6b36-74d5-4e58-9768-168708b2061f.gif?v=3b53d2ff7791536114bbb7f52a3f2380](https://p-843661.f1.n0.cdn.getcloudapp.com/items/YEuObYbQ/7bde6b36-74d5-4e58-9768-168708b2061f.gif?v=3b53d2ff7791536114bbb7f52a3f2380)

The above GIF shows how the API works, it will fetch and fill the data in remaining fields for us. The filling of fields is taken care by Notion Integration.

LET'S BUILD

![https://media4.giphy.com/media/YKLLS6ZGQsrwZVgXix/giphy.gif](https://media4.giphy.com/media/YKLLS6ZGQsrwZVgXix/giphy.gif)

## Notion Integration

To run any automation and access Notion API we need something called Notion integration.

You can create your integration by heading over to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) and create your Notion integration.

Just in case if you get struck anywhere please use the detailed guide mentioned [here](https://developers.notion.com/docs).

It would look something like this once you finished creating the integration.

![https://i.imgur.com/mh0MYDh.png](https://i.imgur.com/mh0MYDh.png)

`KelvinData` is name of my integration, we will be needing the Internal Integration Token for the next section.

### Create Notion Database

Go to any Notion page and click on `/` and search for `Table Full Page` option and click enter.]

You could find the steps in the below generated GIF.

![https://p-843661.f1.n0.cdn.getcloudapp.com/items/BluxPAoq/28e0f6cd-68e2-493e-b366-632cba813db3.gif?v=071f8beb6d51f31a916503ce6e6414cd](https://p-843661.f1.n0.cdn.getcloudapp.com/items/BluxPAoq/28e0f6cd-68e2-493e-b366-632cba813db3.gif?v=071f8beb6d51f31a916503ce6e6414cd)

Now you will need to get your database id of the Database that we have created, you can obtain that by following the step mentioned here [https://developers.notion.com/docs#step-2-share-a-database-with-your-integration](https://developers.notion.com/docs#step-2-share-a-database-with-your-integration).

### Add Integration to the created Notion Database

Now, once we have our database, we have to give access to the Notion integration that we have completed in the first step.

You could find the steps in the below generated GIF.

![https://p-843661.f1.n0.cdn.getcloudapp.com/items/OAunvy8W/71524d66-99cc-41e7-bc1b-620ca32e1f2f.gif?v=aaf5b5a9b4705eeb13036d85af2f3b9c](https://p-843661.f1.n0.cdn.getcloudapp.com/items/OAunvy8W/71524d66-99cc-41e7-bc1b-620ca32e1f2f.gif?v=aaf5b5a9b4705eeb13036d85af2f3b9c)

You can now add the required columns, for the example we are going to do, we will add

- Name
- Twitter
- LinkedIn
- Email
- Misc

You can add many other fields depending on your requirement.

My table rows looks something like to this

![https://i.imgur.com/o6ZC8t4.png](https://i.imgur.com/o6ZC8t4.png)

## Node JS Application

For this application, we are going to use JS to build the Node JS app.

### Create the application

Execute the commands below to create the project and install the required dependencies and dev dependencies.

```bash
mkdir notion-crm-kelvindata # Creates new directory
cd notion-crm-kelvindata # Moves to the created directory

npm init -y # Initialises the basic npm app

npm install @notionhq/client api dotenv # Installing the required dependencies
npm install --save-dev nodemon # Installing the required dev dependencies
```

### Editing the package.json file

Edit the `package.json` file by adding the following lines

`"type": "module",`

This will ensure that we can do the ES6 imports.

in the `scripts` section, add the following script

`"dev": "nodemon index.js"`

This will listen to the changes constantly and run the application.

After completing it, the `package.json` file looks something like this.

```json
{
  "name": "notion-crm-kelvindata",
  "version": "1.0.0",
  "description": "",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon index.js"
  },
  "keywords": [],
  "author": "Rohith Gilla",
  "license": "ISC",
  "dependencies": {
    "@notionhq/client": "^0.3.2",
    "api": "^3.4.0",
    "dotenv": "^10.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.12"
  }
}
```

### Environment file

We will need `NOTION_DATABASE_ID`, `NOTION_SECRET_KEY` and `KELVIN_DATA_KEY`.

We have seen in the first Notion integration setup on how to obtain the database id and the secret key.

Now we need the awesome Kelvin Data API key, it's simple visit [https://www.kelvindata.com/](https://www.kelvindata.com/) and click on **Get API Key** button and fill in the required details and done.

Save that in an environment file, for ease of access I have created an `.env.example` file. You can find the file in the GitHub repository, which will be linked below the blog post.

It would look like this, but you need to fill in the details in place of strings.

```json
NOTION_DATABASE_ID=""
NOTION_SECRET_KEY=""
KELVIN_DATA_KEY=""
```

### Core

Since we are using it as module to use `require` keyword we need to define require by the following way.

```jsx
import { createRequire } from "module";
const require = createRequire(import.meta.url);
```

**Kelvin Data initialisation**

Kelvin Data has good API Reference, you can find it here [https://kelvin-data.readme.io/reference/searchv2_query](https://kelvin-data.readme.io/reference/searchv2_query).

It shows on how to integrate in various frameworks and technologies.

We use Node so first steps we need to initialise the kelvin data sdk that we are going to use for searching the user database.

```jsx
const kelvinSDK = require("api")("@kelvin-data/v1.0#3bettnkt7yytde");
```

This line will get the required SDK for us, just a quick word the package `api` takes in an OpenAPI specification and generates the `SDK` . It is so cool and useful.

**Notion API initialisation**

```jsx
import { Client } from "@notionhq/client";

const NOTION_SECRET_KEY = process.env.NOTION_SECRET_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

const notion = new Client({ auth: NOTION_SECRET_KEY });
```

**Querying**

Now we have to query \*\*\*\*the Notion table that we have built in step 1.

```jsx
const response = await notion.databases.query({
  database_id: NOTION_DATABASE_ID,
});
```

Simple, we directly query in the database with `database_id` parameter.

We can pass in multiple parameters to `filter` , `sort` and give page sizes. Let's keep simple for this example and pass in just the `database_id` alone.

**Get required fields**

Now we need all the column objects and also more importantly text on the email field.

```jsx
const email = result.properties["Email"];
const name = result.properties["Name"];
const emailText = email[email.type][0]["plain_text"];
const isAdded = result.properties["Added"];
const isAddedBool = isAdded[isAdded.type];
const linkedIn = result.properties["LinkedIn"];
const misc = result.properties["Misc"];
const twitter = result.properties["Twitter"];
```

the variables `email` `name` `isAdded` `linkedIn` `twitter` and `misc` contains the values of the corresponding field.

They are a bit crazy nested objects!!

`const emailText = email[email.type][0]["plain_text"];`

by doing the above operation we get text of the email.

If you see there is a field in the database `Added`, which is checkbox. This will help us understand if the row has already been processed.

To get the value of the field, we do the similar thing what we have done to get the value of the field.

`const isAdded = result.properties["Added"];`

**Initialise the variables with data**

```jsx
var fullName = "Not Found";
var linkedInUrl = "Not Found";
var twitterUrl = "Not Found";
var miscData = "Not Found";
```

These are the data we want to find out about the person in our use case, we will pre-fill them with "Not Found" value and once we find we will replace with the actual value.

**Search and Save**

```jsx
if (!isAddedBool) {
  // Search and save logic
}
```

First things first, we check if the checkbox value is true, which means that the row has already been processed.

**Hit the Kelvin Data API and get the results**

```jsx
const searchResponse = await kelvinSDK["searchV2_query"]({
  email: emailText,
  limit: 1,
});
```

Since the SDK generates everything for us, we just need to query the api with `email`

There are different methods to query the API, you can find those [here](https://kelvin-data.readme.io/reference/searchv2_query).

Now comes the most simple part of the application, getting the required fields from the response and saving them in the variables that we have created above.

```jsx
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
```

**Notion API Update**

The way Notion API update works isn't documented properly for all the use cases, the api docs only talks about updating either a boolean or a number. They don't talk about updating text or other fields.

With a few digging, this is how I found to update it, note that this may change in the future versions, but it would be mostly similar.

We need to construct an object to update the fields, that can be done in the following way.

```jsx
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
          link: linkedInUrl !== "Not Found" ? { url: linkedInUrl } : null,
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
        text: { content: miscData, link: null },
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
        text: { content: fullName, link: null },
        plain_text: fullName,
        href: null,
      },
    ],
  },
};
```

Let's go over an object and check what is happening

```jsx
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
```

- `...linkedIn` we are spreading the initial values, since they contain few fields like `id` and others.
- We need to override the `rich_text` field, to achieve that we do the following by adding the following object to that `rich_text` array.

```jsx
{
    type: "text", // type of the value
    text: {
      content: linkedInUrl,
      link:
        linkedInUrl !== "Not Found" ? { url: linkedInUrl } : null,
    },
    plain_text: linkedInUrl,
    href: null,
  },
```

Similarly we do it with the the other fields.

**Last Step update the object using the Notion API**

This is pretty straight forward, we take in the updated object and update the database using the notion api.

```jsx
await notion.pages.update({
  page_id: result.id,
  properties: changedResult,
});
```

**Error Handling**

We will keep it simple, the whole function will be wrapped in a `try/catch` block.

**Run periodically**

The function which we have needs to run periodically once say every 5 seconds, more like a cron job but not a cron job.

We use JavaScript `setTimeout` function to achieve this.

```jsx
setTimeout(main, 5000);
```

### Stitching everything together

Now let's put everything we have made together 👇

```jsx
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { Client } from "@notionhq/client";

const kelvinSDK = require("api")("@kelvin-data/v1.0#3bettnkt7yytde");
require("dotenv").config();

const NOTION_SECRET_KEY = process.env.NOTION_SECRET_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

kelvinSDK.auth(process.env.KELVIN_DATA_KEY);

const notion = new Client({ auth: NOTION_SECRET_KEY });

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
                text: { content: miscData, link: null },
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
```

### GitHub Repository

You can find the repository here.

[GitHub - Rohithgilla12/notion-crm-kelvindata](https://github.com/Rohithgilla12/notion-crm-kelvindata)

Please star the repository if you liked it.

## Next Steps

The Notion is so powerful and the integrations made it even more powerful.

Kelvin Data is an amazing API and the ideas are limitless, from a personal CRM to an enterprise level extensions and more.

Keep shipping and create wonders.

Thanks,

Rohith Gilla
