# Recognition Slackbot
一個可以辨識圖片的聊天機器人。目前此機器人的 endpoint 尚無保護措施。

# Get Started
## Add Slack Credential
Add a file named `local.yml`, put you slack bot's oauth token.
```
slack:
  accessToken: "xoxb-xx...xx"
```

## Add Endpoint to Slack
Let slack push event to your endpoint in aws api gateway. Setting this on slack.

## Deploy 
Then you can run your app.
```
serverless deploy
```
