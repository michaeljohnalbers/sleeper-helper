# Website
The website is a static site hosted from an S3 bucket. See [this](https://docs.aws.amazon.com/AmazonS3/latest/userguide/website-hosting-custom-domain-walkthrough.html)
for instructions on setting up the bucket.

The website is a UI for interacting with the data provided from the [scraper](../scraper).

website uses:
* [pnpm](https://pnpm.io)
* [Webpack](https://webpack.js.org)
* [Typescript](https://www.typescriptlang.org)
* [React](https://react.dev/)
* [Material UI](https://mui.com/material-ui/getting-started/)

Webpack is set up to provide development and production support. See https://webpack.js.org/guides/ for lots of help.
See the sections below for details specific to this project.

## Setup
* Install pnpm (see above)
* Install node (https://nodejs.org/en/download/package-manager#debian-and-ubuntu-based-linux-distributions)
* Install packages: `pnpm install`

## Development
Useful design info: https://design.mindsphere.io/patterns/introduction.html 

**There is no need to run `pnpm build` in development, the dev server will handle everything for you.**

### Run
To test locally:
```bash
pnpm start
```
This will start the Webpack [DevServer](https://webpack.js.org/configuration/dev-server/). It opens listen ports
on the localhost loop back as well as the public IP on the network. This server supports hot reloading: any changes
made in the source will automatically be reloaded.

## Production

### Building
To build the production version of the site, run
```bash
pnpm build
```

### Deploying
```bash
cd dist
aws s3 sync . s3://core-fantasy.com
```

## Diff JSON
`diff -y <(jq '.' website/src/keeper_data.json) <(jq '.' website/src/keeper_data_updated.json) | less`
