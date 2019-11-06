//
//  smartBoardZoneServer.js
//
//  Additional code by Milad Nazeri 10/30/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    var DEBUG = true;
 
    // BOARD UI
    // send a message to all registered clients on the state of the board
    var WHITEBOARD_STATUS_ICON = Script.resolvePath("../resources/models/button-state-whiteboard.fbx");
    var SCREENSHARE_STATUS_ICON = Script.resolvePath("../resources/models/button-state-screenshare.fbx");
    function updateCurrentBoardState(id, args) {
        _this.currentBoardState = args[0];
        _this.activePresenterUUID = args[1];

        // The caller should do this for us, but just to make sure...
        if (_this.currentBoardState === "screenshare" && _this.activePresenterUUID !== "") {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `updateCurrentBoardState()`." +
                "Board state was updated to screenshare, but `activePresenterUUID` was not empty!");
            _this.activePresenterUUID = "";
        }

        var smartboardStatusIcon = _this.currentBoardState === "screenshare" ? SCREENSHARE_STATUS_ICON : WHITEBOARD_STATUS_ICON;
        Entities.editEntity(_this.smartboardStatusIconID, {modelURL: smartboardStatusIcon});
        
        if (DEBUG) {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `updateCurrentBoardState()`." +
                "\n`_this.currentBoardState`: " + _this.currentBoardState +
                "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }

        var participants = Object.keys(_this.participants);
        for (var i = 0; i < participants.length; i++) {
            Entities.callEntityClientMethod(participants[i], _this.entityID,
                "receiveBoardState", [_this.currentBoardState, _this.activePresenterUUID]);
        }
    }


    // PARTICIPANTS
    // When a client first enters the zone, register them and send them the state of the board
    function registerParticipant(id, args) {
        var UUID = args[0];

        if (DEBUG) {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `registerParticipant()`." +
                "\n`UUID`: " + UUID + "\n`_this.currentBoardState`: " +
                _this.currentBoardState + "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }

        _this.participants[UUID] = {
            displayName: AvatarList.getAvatar(UUID).displayName
        };

        // Eventually, we'll want to hook up the `Avatar.displayNameChanged()` signal to a handler that
        // changes the Display Name of the broadcaster that is shown to viewers on the Smartboard.
        // That's too advanced for now, so we'll not worry about it yet.

        Entities.callEntityClientMethod(UUID, _this.entityID, "receiveBoardState",
            [_this.currentBoardState, _this.activePresenterUUID]);
    }
    
    
    // Remove a particpant from the screenshare.  If they are the presenter, then end screenshare for everyone
    function removeParticipant(id, args) {
        var UUID = args[0];

        if (DEBUG) {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `removeParticipant()`." +
                "\n`UUID`: " + UUID +
                "\n`_this.currentBoardState`: " + _this.currentBoardState +
                "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }

        if (_this.participants[UUID]) {
            delete _this.participants[UUID];

            if (_this.activePresenterUUID === UUID) {
                if (DEBUG) {
                    console.log("smartBoardZoneServer.js: " + _this.entityID + ": `removeParticipant()`." +
                        "The removed participant was the active presenter. Updating current board state to 'smartboard'...");
                }

                _this.activePresenterUUID = "";
                updateCurrentBoardState(_this.entityID, ["whiteboard", ""]);
            }
        }
    }


    // When the ESS detects that an avatar has been removed from the participants group, call removeParticipant().
    function onAvatarRemovedEvent(UUID) {
        if (DEBUG) {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `onAvatarRemovedEvent()`." +
                "\n`UUID`: " + UUID);
        }

        if (UUID in _this.participants) {
            removeParticipant(_this.entityID, [UUID]);
        }
    }


    // ENTITY SIGNALS
    // check to see if this is a whiteboardOnly zone
    // connect the avatar removed event
    var signalsConnected = false;
    function preload(entityID) {
        _this.entityID = entityID;

        if (DEBUG) {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `preload()`.");
        }

        var userData = Entities.getEntityProperties(entityID, ["userData"]).userData;
        var parsedData = {};
        try {
            parsedData = JSON.parse(userData);
            _this.whiteboardOnlyZone = parsedData.whiteboardOnlyZone;
        } catch (e) {
            console.log("Error reading userData in smartBoardZoneServer.js: " + e);
        }

        if (_this.whiteboardOnlyZone) {
            updateCurrentBoardState(_this.entityID, ["whiteboard", ""]);
        }
        
        if (!signalsConnected) {
            AvatarList.avatarRemovedEvent.connect(onAvatarRemovedEvent);
            signalsConnected = true;
        }

        // TODO: Make sure the actual icon name matches whatever name we try to find it here
        var smartboardChildrenIDS = Entities.getChildrenIDs(_this.smartboard);
        for (var i = 0; i < smartboardChildrenIDS.length; i++) {
            var childID = smartboardChildrenIDS[i];
            var name = Entities.getEntityProperties(childID, "name").name;
            if (name === "Smartboard Status Icon") {
                _this.smartboardStatusIconID = childID;
                break;
            }
        }
    }


    // update the board back to whiteboard only
    // might be unnessary, but maybe help clear left over local entities
    function unload() {
        if (DEBUG) {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `unload()`.");
        }

        updateCurrentBoardState(_this.entityID, ["whiteboard", ""]);
        
        if (signalsConnected) {
            AvatarList.avatarRemovedEvent.disconnect(onAvatarRemovedEvent);
        }
        signalsConnected = false;
    }


    // SMARTBOARD OBJECT
    var _this;
    function SmartboardZoneServer() {
        _this = this;
        this.entityID;
        this.activePresenterUUID = "";
        this.currentBoardState = "selection";
        this.participants = {};
        this.whiteboardOnlyZone = false;
        this.smartboardStatusIconID;
        this.remotelyCallable = [
            "updateCurrentBoardState",
            "registerParticipant",
            "removeParticipant"
        ];
    }


    SmartboardZoneServer.prototype = {
        preload: preload,
        unload: unload,
        updateCurrentBoardState: updateCurrentBoardState,
        registerParticipant: registerParticipant,
        removeParticipant: removeParticipant
    };


    return new SmartboardZoneServer();
});
