import Service from "./comm_service";
import Socket from "./comm_socket";

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

var body = document.getElementsByTagName("BODY")[0];

function updateOnlineStatus(event) {
   var onLine = navigator.onLine;
   var element = document.getElementById("offlinePrompt");

   // just in case the dom element doesn't exisit already create it
   if (!element) {
      body.insertAdjacentHTML(
         "afterbegin",
         "<div id='offlinePrompt' style='height: 0px;'><i class='fa fa-warning'></i> " +
            L(
               "ab.interface.offlinePrompt",
               "*Oops, we cannot find an internet connection."
            ) +
            "</div>"
      );
      element = document.getElementById("offlinePrompt");
   }

   if (!onLine) {
      // if not online show the prompt
      element.style.height = "30px";
   } else {
      // if online hide the prompt
      element.style.height = "0px";
   }
}

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

var countdownStarted = false;
var countInterval;
var pingFails = 0;

function ping() {
   if (!navigator.onLine) return false;
   var element = document.getElementById("connectionPrompt");

   var countdown = 30;
   pingFails++;
   // if our ping fails more than 40 times you have been idle for 20 minutes
   if (pingFails > 40) {
      body.insertAdjacentHTML(
         "afterbegin",
         `<div id='reloadPrompt'>
            <div>
               <i class="fa fa-clock-o" style="font-size: 90pt;"></i>
               <br>
               ${L(
                  "ab.interface.reloadPrompt1",
                  "*You have been idle for too long."
               )}
               <br>
               <button class="reloadPage" onclick="location.reload();">
               ${L("ab.interface.reloadPrompt2", "*Reload page")}
               </button>
            </div>
         </div>`
      );
      clearInterval(vpnCheck);
      clearInterval(countInterval);
      if (element) element.style.height = "0px";
      return false;
   }

   // just in case the dom element doesn't exisit already create it
   if (!element) {
      body.insertAdjacentHTML(
         "afterbegin",
         `<div id='connectionPrompt' style='height: 0px;'>
         <div id='countdown'>
           <div id='countdown-number'></div>
           <svg>
             <circle r='9' cx='10' cy='10'></circle>
           </svg>
         </div> ${L(
            "ab.interface.offlinePrompt",
            "*Oops, we cannot communicate with the site."
         )}
         </div>`
      );

      element = document.getElementById("connectionPrompt");
   }

   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
         if (this.status == 200) {
            element.style.height = "0px";
            pingFails = 0;
            clearInterval(countInterval);
         } else {
            element.style.height = "30px";
            countdownStarted = true;

            var countdownNumberEl = document.getElementById("countdown-number");
            countdownNumberEl.textContent = countdown;

            clearInterval(countInterval);
            countInterval = setInterval(function() {
               countdown = --countdown <= 0 ? 30 : countdown;
               countdownNumberEl.textContent = countdown;
            }, 1000);
         }
      }
   };
   xhttp.open("GET", window.location.href + "favicon.ico", true);
   xhttp.send();
}

// check VPN every 30 seconds
var vpnCheck = setInterval(ping, 30000);

export default {
   // OP.Comm.Service.*
   Service: Service,
   Socket: Socket
};
