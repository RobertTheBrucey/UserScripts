// ==UserScript==
// @name       Twitch Regex Chat Filter
// @namespace   twitchRegexChatFilter
// Update the match section to specify streams to filter out
// @match      *twitch.tv/darkviperau
// @match      *twitch.tv/callmekevin
// @version     0.96
// @description A script to filter out the chat commands by regex
// ==/UserScript==
// 7TV breaks this script :(
var interval;
var regex = /^!?[1-8]$/; //Currently set to filter out messages for chat controls chaos, which is a number 1-8 with no other characters

function filterChat(event){
    var chatParent = document.getElementsByClassName("chat-scrollable-area__message-container")[0];
    var msgSpan = event.target.querySelector('.text-fragment');
    try {var message = msgSpan.innerHTML;} catch {return;}

    message = message.toUpperCase().replace(/\s+/g, '');
    if (message == "") {return;}

    if(regex.test(message.replace(/.,!/g, '').trim())){
        if (event.target.parentNode != null) {
            console.log("TRCF - Removing " + event.target + " from " + event.target.parentNode + " as message = " + message);
            if (event.target.style['display'] != 'none') {
                event.target.style["display"] = "none";
            }
        }
    }
}

function checkIfLoaded()
{
    var chatParent = document.getElementsByClassName("chat-scrollable-area__message-container")[0];
	try{chatParent.children}
	catch(err)
	{
	return;
	}
    chatParent.addEventListener("DOMNodeInserted",filterChat);
    window.clearInterval(interval);
}

interval = window.setInterval(checkIfLoaded,20);
console.log("TRCF - Loaded");