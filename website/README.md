# Website
The website is a static site hosted from an S3 bucket. See [this](https://docs.aws.amazon.com/AmazonS3/latest/userguide/website-hosting-custom-domain-walkthrough.html)
for instructions on setting up the bucket.

The website is a UI for interacting with the data provided from the [scraper](../scraper).

website uses:
* [pnpm](https://pnpm.io) for package management

## Run
To test locally:
```bash
cd website
python3 -m http.server
```
Go to http://127.0.0.1:8000/

For mobile testing
```bash
cd website
python3 -m http.server --bind 192.168.0.26  # Or whatever the IP of the machine is
```

## Deploy
```bash
cd website
aws s3 sync . s3://core-fantasy.com
```

## Diff JSON
`diff -y <(jq '.' website/keeper_data.json) <(jq '.' website/keeper_data_updated.json) | less`
