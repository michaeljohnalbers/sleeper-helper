# sleeper-helper

Tool to help with core.fantasy in https://sleeper.com.

Website is at http://core-fantasy.com

## Website
Created with steps from https://docs.aws.amazon.com/AmazonS3/latest/userguide/website-hosting-custom-domain-walkthrough.html
### Running
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

## Updating files
```bash
cd website
aws s3 sync . s3://core-fantasy.com
```