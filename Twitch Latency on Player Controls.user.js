// ==UserScript==
// @name         Twitch Latency on Player Controls and Resetter
// @namespace    https://helpful.stream
// @version      0.4
// @description  Takes the Latency to Broadcaster in the video settings menu and places it in the player controls with optional auto-catchup checkbox.
// @description  Will pause/unpause the stream to catch up to realtime if latency increases by more than Defined Latency
// @author       RobertTheBrucey
// @source       https://github.com/RobertTheBrucey/UserScripts
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==
// Based on https://greasyfork.org/en/scripts/391680-twitch-latency-on-player-controls/code
console.log("Loading Twitch Latency Resetter");
var initLatency = 0;
var triggerLatency = 2;
var reloadSVG = `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="20px" height="20px" viewBox="0 0 102.455 102.455" style="enable-background:new 0 0 102.455 102.455;"
	 xml:space="preserve">
<g>
	<g>
		<path style="fill:#00FF00" d="M61.977,17.156L48.277,30.855c-0.789,0.79-2.074,0.79-2.866,0l-0.197-0.202V20.568
			c-16.543,1.156-29.65,14.975-29.65,31.806c0,11.82,6.487,22.617,16.937,28.175c2.631,1.402,3.631,4.671,2.233,7.31
			c-1.403,2.635-4.671,3.634-7.306,2.231c-13.983-7.44-22.67-21.889-22.67-37.716c0-22.792,17.953-41.47,40.457-42.641V0.792
			l0.197-0.199c0.792-0.79,2.077-0.79,2.866,0l13.699,13.696C62.771,15.083,62.771,16.369,61.977,17.156z"/>
		<path style="fill:#00FF00" d="M54.174,101.861L40.477,88.166c-0.792-0.79-0.792-2.074,0-2.864l13.697-13.695c0.791-0.794,2.074-0.794,2.868,0
			l0.191,0.198l0.007,10.082C73.776,80.733,86.89,66.918,86.89,50.084c0-11.82-6.491-22.614-16.939-28.175
			c-2.635-1.4-3.635-4.675-2.234-7.31c1.406-2.635,4.678-3.634,7.312-2.231c13.979,7.44,22.669,21.892,22.669,37.716
			c0,22.794-17.953,41.469-40.457,42.636v8.942l-0.198,0.198C56.248,102.652,54.965,102.652,54.174,101.861z"/>
	</g>
</g>
</svg>`;
var reloadSVG2 = `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="20px" height="20px" viewBox="0 0 102.455 102.455" style="enable-background:new 0 0 102.455 102.455;"
	 xml:space="preserve">
<g>
	<g>
		<path style="fill:#FF0000" d="M61.977,17.156L48.277,30.855c-0.789,0.79-2.074,0.79-2.866,0l-0.197-0.202V20.568
			c-16.543,1.156-29.65,14.975-29.65,31.806c0,11.82,6.487,22.617,16.937,28.175c2.631,1.402,3.631,4.671,2.233,7.31
			c-1.403,2.635-4.671,3.634-7.306,2.231c-13.983-7.44-22.67-21.889-22.67-37.716c0-22.792,17.953-41.47,40.457-42.641V0.792
			l0.197-0.199c0.792-0.79,2.077-0.79,2.866,0l13.699,13.696C62.771,15.083,62.771,16.369,61.977,17.156z"/>
		<path style="fill:#FF0000" d="M54.174,101.861L40.477,88.166c-0.792-0.79-0.792-2.074,0-2.864l13.697-13.695c0.791-0.794,2.074-0.794,2.868,0
			l0.191,0.198l0.007,10.082C73.776,80.733,86.89,66.918,86.89,50.084c0-11.82-6.491-22.614-16.939-28.175
			c-2.635-1.4-3.635-4.675-2.234-7.31c1.406-2.635,4.678-3.634,7.312-2.231c13.979,7.44,22.669,21.892,22.669,37.716
			c0,22.794-17.953,41.469-40.457,42.636v8.942l-0.198,0.198C56.248,102.652,54.965,102.652,54.174,101.861z"/>
	</g>
</g>
</svg>`;
var checkboxHTML = `<div id='userScript_latencyDiv'>0:00</div>\
<div class='sc-AxjAm StDqN' id='userScript_latencyToggleDiv'>\
  <label for=\"userScript_latencyToggle\" class=\"userScript_toggleSVG\"></label>\
  <input id='userScript_latencyToggle' type=\"checkbox\" checked>\
</div>`;

(function () {
    'use strict';

    window.addEventListener('load', function () {

        // we have to open the video stats in order for Twitch to generate them.
        setTimeout(function () {
            console.log("Adding Reset Checkbox");
            var control_groups = document.querySelectorAll(".player-controls__right-control-group")
            control_groups[0].insertAdjacentHTML("afterbegin", checkboxHTML);

            console.log("Enabling Latency Monitoring");
            //Open stream settings
            document.querySelector("button[data-a-target='player-settings-button']").click();

            //Select Advanced sub-menu
            setTimeout(function () {
                document.querySelector("button[data-a-target='player-settings-menu-item-advanced']").click();
            }, 1000);

            //Open Video Stats
            setTimeout(function () {
                var selectors = document.querySelectorAll("input[data-a-target='tw-toggle']");
                var selector;
                for (var x = 0; x < selectors.length; x++) {
                    selector = selectors[x];
                    try {
                        if (selector.parentNode.parentNode.querySelector("label").innerHTML === "Video Stats") {
                            selector.click();
                            break;
                        }
                    } catch (error) { }
                }

                // Hide Video Stats window
                document.querySelector("div[data-a-target='player-overlay-video-stats']").style.display = "none";

                console.log("Latency Monitoring Active");

                setInterval(function () {
                    var userScript_latency = document.querySelector("p[aria-label='Latency To Broadcaster']").innerText;
                    if (initLatency == 0) { initLatency = parseFloat(userScript_latency); }
                    else if (parseFloat(userScript_latency) < initLatency) { initLatency = parseFloat(userScript_latency); }
                    if (document.getElementById("userScript_latencyDiv")) {
                        document.getElementById("userScript_latencyDiv").innerText = userScript_latency;
                    } else {
                        document.querySelector("div[data-a-target='player-overlay-video-stats']").style.display = "none";
                        document.querySelector(".player-controls__right-control-group").insertAdjacentHTML("afterbegin", "<div id='userScript_latencyDiv'>0:00</div>");
                    }
                    if ((parseFloat(userScript_latency) - initLatency) > 2 && document.getElementById("userScript_latencyToggle").checked) {
                        console.log("Resetting stream due to latency");
                        document.querySelector("button[data-a-target='player-play-pause-button']").click();
                        document.querySelector("button[data-a-target='player-play-pause-button']").click();
                        initLatency = 0;
                    }
                }, 2000);

                document.querySelector("button[data-a-target='player-settings-button']").click();
            }, 1000);

        }, 3000);
    })

})();
