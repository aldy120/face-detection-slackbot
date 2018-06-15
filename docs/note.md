# Event Subscriptions
## Challnege
想要接收 slack 發送的 event ，好知道誰又發了什麼訊息嗎，那你可能需要這個功能。你可以給 slack 一個 url ，來訂閱 event 。但在成功訂閱之前，你必須先跟他完成 handshake 。他會先發送一個 challenge 給你的 url ， 然後你必須回應同樣的 challenge 這樣就開通了。