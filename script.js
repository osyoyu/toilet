const WS_SERVER_URL = "ws://localhost";

var webSocket = null;
var myName = null;

// open websocket connection
function openWebSocketConnection() {
    if (!webSocket) {
        webSocket = new WebSocket(WS_SERVER_URL);

        // set handlers
        webSocket.onopen = onOpen;
        webSocket.onmessage = onMessage;
        webSocket.onclose = onClose;
        webSocket.onerror = onError;
    }
}

function onOpen(event) {
    console.log("===== on ws open =====");
    console.log(event);
}

function onError(event) {
    console.error("===== on ws error =====");
    console.error(event);
}

function onClose(event) {
    console.log("===== on ws close =====");
    webSocket = null;

    // try reconnect
    setTimeout(openWebSocketConnection, 3000);
}

function onMessage(event) {
    if (event && event.data) {
        var msg = JSON.parse(event.data);
        console.log("===== on message =====");
        console.log(msg);
        switch (msg.type) {
            case "join":
                onJoinedSuccessfully(msg);
                break;
            case "status":
                onStatusMessage(msg);
                break;
        }
    } else {
        console.error("===== on error message  =====");
        console.error(event);
    }
}

/* ### メッセージハンドラ ### */

/*
他のユーザがこうげきしたとき
{
  "type": "status",
  "status": {
    alive: true
    image: <url>,
    last_attack: {
      name: "something",
      damage: 69
    }
  }
}
*/
function onStatusMessage(msg) {
    changePhoneImage(msg.image);
    addDamageStatusLine(msg.name, msg.damage, msg.alive);
}


/*
送ったjoinメッセージへのレスポンスがきたとき
{
  "type": "join",
  "status": {
    alive: true
    image: <url>
  }
}
*/
function onJoinedSuccessful(msg) {
    changePhoneImage(msg.status.image)
}




/* ###メッセージ送るやつ ### */

/*
アタックしたメッセージ
{
    type: "attack",
    attack: {
        name: "myname",
        weapon: "something"
        }
}
*/
function sendAttackMessage(weapon) {
    var msg = {
        "type": "attack",
        "attack": {
            "name": getMyName(),
            "wepon": weapon
        }
    };
    webSocket.send(JSON.stringify(msg));
    console.log("===== sent attack message =====");
    console.log(msg);
}

/*
参加するときにサーバーに送るメッセージ
{
    type: "join",
    name: "myname"
}
*/
function sendJoinMessage() {
    var msg = {
        "type": "join",
        "name": getMyName()
    };
    webSocket.send(JSON.stringify(msg));
    console.log("===== sent join message =====");
    console.log(msg);
}

/* ### DOM処理 ### */

// ステータス表示追加
function addDamageStatusLine(userName, damage, isAlive) {
    // TODO dom要素追加
    var logger = document.getElementById("log");
    var log = document.createElement("p");
    log.classList.add("attack-log");
    log.textContent = `${userName} : ${damage}`;
    logger.appendChild(log);
    (new Audio("./sound/crash.wav")).play();
}

// でんわの画像を変える
function changePhoneImage(image) {
    // TODO 画像要素のsrc変える
    var iPhone = document.getElementById("iphone");
    iPhone.setAttribute("src", image);
}

// 自分の名前取得
function getMyName() {
    // TODO: inputからとってくる
    return document.getElementById("username").value; 
}



/* ### 名前確定時の処理 ### */
$("#join").on("click", function() {
    openWebSocketConnection();
    sendJoinMessage();
});

Array.from(document.getElementsByClassName("weapon")).forEach(function(elm) {
  elm.addEventListener("click", function(e) {
    sendAttackMessage(e.target.id);
  });
});
