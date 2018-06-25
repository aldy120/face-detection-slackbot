# Event Subscriptions
## Challnege
想要接收 slack 發送的 event ，好知道誰又發了什麼訊息嗎，那你可能需要這個功能。你可以給 slack 一個 url ，來訂閱 event 。但在成功訂閱之前，你必須先跟他完成 handshake 。他會先發送一個 challenge 給你的 url ， 然後你必須回應同樣的 challenge 這樣就開通了。

## slack 重複送 event
收到 event 沒有回應 200 給 slack 的話，他會一直變動時間間隔 (看起來是指數增長) 重複發 event 給你。當你不知道為什麼收到很多重複的 event 的話，可能是這個原因。

在 local invoke 的時候成功，而在 remote invoke 卻被重複送，就要想想是不是 slack 那端的問題，而 slack 重複送，則是因為我們沒有回應已收到的訊息 (200) 。

## 如何放框框到圖上把某種東西框起來
### Graphic Magick
很強大的影像處理 library ，但是需要安裝 cli 在本地。

### OpenCV
好像太功能太強

### Sharp
專門處理縮放或濾鏡，不能在上面畫框框

### PureImage
這跟瀏覽器的 canvas api 很像，完全不用依靠本地裝在作業系統的特殊套件。只是畫線的粗度好像調整不起來。

## [node-canvas](https://github.com/Automattic/node-canvas/wiki/Installation---AWS-Lambda)
看起來不用額外的東西，只要 npm 就可以裝好，所以很適合拿來跑 lambda funciton 。其實不是這樣的，他會用 gyp 幫你建立一個與作業系統相依的東西在 node_modules/canvas 裡面。這會讓你在本地裝的 serverless function 可以執行，但是放在雲端又不能執行，實在很糟糕。

node-canvas 超廢，居然要開一台 ec2 來幫他建立 lib/ 跟 node_module ，再下載回去。下載回去好麻煩怕下次還要用到，所以先開個 s3 來存放。

## 上傳一個圖片結果回應一堆是怎樣
由於處理時間太久，超過三秒才回 200 會導致重送 event。 slack 重送的原則是，如果 3 秒內沒回應，就再送一次，如果再沒回應，就 5 分鐘後再送一次。

## Invoked Function Failed
呼叫 lambda 函數，結果回應 Error: Invoked function failed 。就相當於瀏覽器收到 500 錯誤一樣，你必須到 cloudwatch 看看，才會了解到底發生了什麼事。

# Note
Read my [note](note.md).