# Website
The website is a static site hosted from an S3 bucket. See [this](https://docs.aws.amazon.com/AmazonS3/latest/userguide/website-hosting-custom-domain-walkthrough.html)
for instructions on setting up the bucket.

The website is a UI for interacting with the data provided from the [scraper](../scraper).

website uses:
* [pnpm](https://pnpm.io) for package management
* [webpack](https://webpack.js.org) for bundling & development help

## Development

### Build/Assemble
Use pnpm & webpack to build the full set of files for the website

```bash
pnpm build
```
This will create the final website files in the **dist** directory.

### Run
To test locally:
```bash
pnpm start
```
This will start the Webpack [DevServer](https://webpack.js.org/configuration/dev-server/). It opens listen ports
on the localhost loop back as well as the public IP on the network. This server supports hot reloading: any changes
made in the source will automatically be reloaded.

## Deploy
```bash
cd website
aws s3 sync . s3://core-fantasy.com
```

## Diff JSON
`diff -y <(jq '.' website/src/keeper_data.json) <(jq '.' website/src/keeper_data_updated.json) | less`
