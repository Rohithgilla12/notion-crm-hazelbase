# Hazelbase

## Introduction

Hazelbase and Notion are two powerful tools that can be used together to create a custom CRM system. With Hazelbase, you can organize data from the internet into an identity network with billions of records that anyone can use and contribute to. With Notion, you can create a custom application that can be used as a CRM tool. In this blog post, we will go over how to create the Node JS application, as well as the deployment solutions and future ideas for this project.

## The application demo



Demo
https://getkap-gifs.s3.ap-south-1.amazonaws.com/Kapture%202023-01-30%20at%2009.08.44.gif



## How to develop it

### Pre-requisites

- Basic JavaScript
- Node JS
- Notion Account
- Hazelbase account

### Creating an Hazel base account

To get started, visit [https://dashboard.hazelbase.com/sign-in](https://dashboard.hazelbase.com/sign-in) and create your Hazelbase account. After you have registered your account, go to the **Organisations** tab and create your own organisation. Once your organisation is created, you will be able to access the Dashboard. To help you get started, we have provided a step-by-step guide in the image below. Just follow these simple instructions and you will be up and running in no time at all.

![Creating dashboard](https://i.imgur.com/kE7oMNS.png)

**Obtaining Hazel base API key**

Once you have navigated to the dashboard, you can follow these simple steps to create your own personal API key:

- Click the "Show Developer Portal" button, located in the left sidebar of the page.
- Give your API key a descriptive name to help you remember its purpose.
- Click the "Create" button to generate the code.
- Your API key is now ready to use!
- To get a better understanding of how to use your new key, you can explore the GraphQL Explorer, which acts as a playground of sorts, allowing you to experiment with different queries and mutations.

![Creating the API Key](https://i.imgur.com/2u7bqKN.png)


### Creating the Notion integration

The Notion team has done truly remarkable work on their documentation for developing Notion integrations. This step-by-step process can be found [here](https://developers.notion.com/docs/create-a-notion-integration), and it is an incredibly helpful guide for developers looking to create an integration. It gives an overview of the entire process and outlines the requirements for creating an integration, as well as providing helpful tips and guidance. Furthermore, there are detailed instructions on how to connect with the Notion API and set up the necessary authentication. With the Notion team's comprehensive documentation, developers should have no trouble creating an integration.

We will need the Internal Integration Token for the next section.

### Adding the Integration to the Created Notion Database

Now that we have our database, we need to give access to the Notion integration we created in the first step.

The steps can be seen in the GIF below:

![https://p-843661.f1.n0.cdn.getcloudapp.com/items/OAunvy8W/71524d66-99cc-41e7-bc1b-620ca32e1f2f.gif?v=aaf5b5a9b4705eeb13036d85af2f3b9c](https://p-843661.f1.n0.cdn.getcloudapp.com/items/OAunvy8W/71524d66-99cc-41e7-bc1b-620ca32e1f2f.gif?v=aaf5b5a9b4705eeb13036d85af2f3b9c)

You can add many different fields to the table, depending on your needs. For this example, we will add:

- Name
- Twitter
- LinkedIn
- Email
- Misc

The table rows will look something like this:

![https://i.imgur.com/o6ZC8t4.png](https://i.imgur.com/o6ZC8t4.png)

### Creating the Node JS application

Execute the following commands to create the project and install the required dependencies and dev dependencies:

```
mkdir notion-crm-hazelbase # Create new directory
cd notion-crm-hazelbase # Move to the created directory

npm init -y # Initialize the basic npm app

npm install @notionhq/client dotenv # Install the required dependencies
npm install --save-dev nodemon # Install the required dev dependencies

```

### Editing the `package.json` File

Edit the `package.json` file by adding the following line:

`"type": "module",`

This will ensure that we can use ES6 imports.

In the `scripts` section, add the following script:

`"dev": "nodemon index.js"`

This will listen for changes and run the application constantly.

After completing it, the `package.json` file looks something like this.

```jsx
{
  "name": "notion-crm-hazelbase",
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
    "dotenv": "^10.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.12"
  }
}
```

### Environment file

We will need the `NOTION_DATABASE_ID`, `NOTION_SECRET_KEY`, and `HAZEL_BASE_KEY` to complete the Notion integration setup. We have seen how to obtain the database ID and the secret key in the first step of the integration process. The `HAZEL_BASE_KEY` was obtained in the initial steps.

It is recommended that you save these credentials in an environment file for convenience and easier access. I have provided an `.env.example` file in the GitHub repository which is linked below the blog post. This file should provide an idea of what your environment file should look like, however, you will need to fill in the details in place of strings with the correct information.

```
NOTION_DATABASE_ID=""
NOTION_SECRET_KEY=""
HAZEL_BASE_KEY=""

```

### Core

Since we are using it as module to use `require` keyword we need to define require by the following way.

```jsx
import { createRequire } from "module";
const require = createRequire(import.meta.url);
```

The Hazel base exposes a `graphql` endpoint, which can be consumed using any of the popular clients such as Apollo, Relay, or even the GraphQL.js library. For simplicity, let's use the `POST` method to obtain the results of the API call. This method is convenient for sending data to the endpoint and receiving results back, which can be used to construct a query and receive the desired data. Additionally, it is easy to understand and can be used with minimal setup and configuration.

```jsx
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
```

This query has been taken from the `API Explorer`

![API Explorer](https://i.imgur.com/L6amtPv.png)


Now, we will send a GraphQL query to the endpoint using the email address of the user we are trying to locate. This query holds the potential to provide us with the relevant information related to the user, such as their first and last name, contact details and other personal information. Moreover, the query can also provide us with any additional information that may have been associated with the user, such as their age, gender, or any other preferences they may have stored. By utilizing this query, we can quickly and easily access the information that is necessary to accurately identify the user in question.

```jsx
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
```

**Notion API initialisation**

```jsx
import { Client } from "@notionhq/client";

const NOTION_SECRET_KEY = process.env.NOTION_SECRET_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

const notion = new Client({ auth: NOTION_SECRET_KEY });

```

**Querying**

Now we have to query  the Notion table that we have built in step 1.

```jsx
const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
  });

```

We can directly query the database with the `database_id` parameter. We can also pass in multiple parameters to `filter`, `sort`, and set page sizes. For this example, we'll keep it simple and pass in just the `database_id`.

We need to get the column objects and, more importantly, the text in the email field.

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

The variables `email`, `name`, `isAdded`, `linkedIn`, `twitter`, and `misc` contain the values of the corresponding fields. They are a bit crazy nested objects!

To get the text of the email, we can use the following operation: `const emailText = email[email.type][0]["plain_text"];`.

Additionally, there is a field in the database called `Added`, which is a checkbox. This will help us understand if the row has already been processed. To get the value of this field, we can use a similar operation as we used to get the value of the other fields.

`const isAdded = result.properties["Added"];`

**Initialise the variables with data**

```jsx
var fullName = "Not Found";
var linkedInUrl = "Not Found";
var twitterUrl = "Not Found";
var miscData = "Not Found";

```

We want to find out the following data about the person in our use case. We will pre-fill them with "Not Found" value, and replace with the actual value once we find it.

**Search and Save**

```jsx
if (!isAddedBool) {
	// Search and save logic
}

```

First, we check if the checkbox value is `true`, indicating that the row has already been processed.

The easiest part of the whole code, hit the endpoint and get the results.

```jsx
const searchResponse = await getSearchResults(emailText)
```

We get the required fields from the response and save them in the variables we created earlier.

```
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

```

Let's go over an object and check what is happening

```js
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

```js
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

This is pretty straight forward,  we take in the updated object and update the database using the notion api.

```js
await notion.pages.update({
  page_id: result.id,
  properties: changedResult,
});

```

**Error Handling**

We will keep it simple; the whole function will be wrapped in a `try/catch` block to ensure that any errors that arise during the function's execution can be caught and handled accordingly. This will help us maintain the integrity of our program, as any errors that occur would not be allowed to cause it to crash.

**Run Periodically**

The function we have needs to run periodically, say every 5 seconds, similar to a cron job but not a cron job. This could be achieved by setting up a timer that runs the function every 5 seconds, thus making sure the function is always executed every 5 seconds.

We can use the JavaScript `setTimeout` function to achieve this. `setTimeout` is a function which takes two arguments; the first argument is the function to be executed and the second argument is the time in milliseconds after which the function should be executed. Therefore, we can use `setTimeout` to set up a timer that will run our function every 5 seconds (5000 milliseconds).

```jsx
setTimeout(main, 5000);
```

### Combining everything together

Once we have done all the above steps, the end results would be similar to this `index.js` file

[https://github.com/Rohithgilla12/notion-crm-hazelbase/blob/master/index.js](https://github.com/Rohithgilla12/notion-crm-hazelbase/blob/master/index.js)

### GitHub Repository

You can find the repository here.

[https://github.com/Rohithgilla12/notion-crm-hazelbase](https://github.com/Rohithgilla12/notion-crm-hazelbase)

Please star the repository if you liked it.

## Deployment solutions

Here, we won't cover deployment in this blog post, but we'll suggest some free alternatives. You can deploy Node.js applications on Deta using Deta Micros; learn more [here](https://docs.deta.sh/docs/micros/getting_started/#creating-your-first-micro). Deta Micros is a great solution for those looking for an easy-to-use, hassle-free way to deploy their Node.js applications. Vercel also offers Node.js [Runtimes](https://vercel.com/docs/runtimes#official-runtimes/node-js) as an option for deployment, offering an intuitive and user-friendly platform. Additionally, you can check out [StackBlitz](https://stackblitz.com/edit/node) and [Replit](https://replit.com/), both of which provide convenient and straightforward solutions for Node.js deployment. No matter what your needs are, there is a suitable solution out there; these are just a few of the many options available.

Keep shipping and create wonders!!
