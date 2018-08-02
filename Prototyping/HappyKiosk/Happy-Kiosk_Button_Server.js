// Happy-Kiosk_Button_Server.js
// 
// Further Edited by Milad Nazeri on 07/31-2018 from Zombie-Gate Button
// Edited by Rebecca Stankus on 03/07/2018
// from button1.js by Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// Controls visual actions of the button presses.  Is routed through the zone kiosk.

/* global Pointers */

(function () {

    // Helper Functions
    var Util = Script.require("../../Utilities/Helper.js?" + Date.now());

    // Log Setup
    var LOG_CONFIG = {},
        LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE;

    LOG_CONFIG[LOG_ENTER] = true;
    LOG_CONFIG[LOG_UPDATE] = true;
    LOG_CONFIG[LOG_ERROR] = true;
    LOG_CONFIG[LOG_VALUE] = true;
    LOG_CONFIG[LOG_ARCHIVE] = false;
    var log = Util.Debug.log(LOG_CONFIG);

    // Init 
    var 
        entityID,
        name,
        currentUUID = null,
        position,
        kioskZoneID,
        self,
        currentHand = 0,
        rating = 1;

    // Const
    var BASE_NAME = "Happy-Kiosk_",
        BUTTON_PRESS_OFFSET = 0.03,
        DOWN_TIME_MS = 1500;

        // Collections
    var currentProperties = {},
        position = {},
        userData = {},
        userdataProperties = {};

    // Entity Definition
    function HappyKiosk_Button() {
        self = this;
    }

    HappyKiosk_Button.prototype = {
        remotelyCallable: [
            "pressButton",
            "updateCurrentHand"
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID);
            name = currentProperties.name;
            position = currentProperties.position;
            kioskZoneID = currentProperties.parentID;

            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                rating = userdataProperties.rating;
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }
        },
        lowerButton: function() {
            log(LOG_ENTER, name + " lowerButton");
            position.y -= BUTTON_PRESS_OFFSET;
            Entities.editEntity(entityID, {
                position: position
            });
            position.y += BUTTON_PRESS_OFFSET;
        },
        pressButton: function(id, param) {
            log(LOG_ENTER, name + " pressButton");

            currentUUID = param[0];

            Entities.callEntityClientMethod(currentUUID, entityID, "makeHaptic");
            Entities.callEntityMethod(kioskZoneID, "sendInput", [new Date(), rating]);

            self.lowerButton();
            Script.setTimeout(function() {
                self.raiseButton();
            }, DOWN_TIME_MS);
            return;
        },
        raiseButton: function() {
            log(LOG_ENTER, name + " raiseButton");

            Entities.editEntity(entityID, {
                position: position
            });
        },
        updateCurrentHand: function(id, param) {
            currentHand = Number(param[0]);
        },
        unload: function () {
        }
    };

    return new HappyKiosk_Button();
});
