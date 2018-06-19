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
這跟瀏覽器的 canvas api 很像