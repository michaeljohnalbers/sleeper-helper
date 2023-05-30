# sleeper-helper

Tool to help with core.fantasy in https://sleeper.com.


## Website
Created with steps from https://docs.aws.amazon.com/AmazonS3/latest/userguide/website-hosting-custom-domain-walkthrough.html
### Running
To test locally:
```bash
cd website
python3 -m http.server
```
Got to http://localhost:8000/

## Updating files
```bash
cd website
aws s3 sync . s3://core-fantasy.com
```