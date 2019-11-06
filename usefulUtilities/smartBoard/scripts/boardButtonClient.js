//
//  boardButtonClient.js
//
//  Additional code by Milad Nazeri 10/30/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals Screenshare */

(function(){
    var DEBUG = true;

    // ENTITY SIGNALS
    function preload(entityID) {
        if (DEBUG) {
            console.log("boardButtonClient.js: " + entityID + ": `preload()`.");
        }
        _this.entityID = entityID;
        var props = Entities.getEntityProperties(entityID, ["parentID"]);

        var children = Entities.getChildrenIDs(props.parentID);
        
        for (var i = 0; i < children.length; i++) {
            var name = Entities.getEntityProperties(children[i], 'name').name;
            if (name === "Smartboard Zone") {
                _this.screenshareZoneID = children[i];
                break;
            }
        }
        
        Entities.callEntityMethod(_this.screenshareZoneID, "buttonPreloadComplete");
    }


    var ACTIVE_SCREENSHARE_MODEL_URL = Script.resolvePath("../resources/models/button-stop-screen-share.fbx");
    var INACTIVE_SCREENSHARE_MODEL_URL = Script.resolvePath("../resources/models/button-start-screen-share.fbx");
    function updateModelURL() {
        var newModelURL = _this.activePresenterUUID === "" ? INACTIVE_SCREENSHARE_MODEL_URL : ACTIVE_SCREENSHARE_MODEL_URL;

        if (DEBUG) {
            console.log("boardButtonClient.js: " + _this.entityID + "`updateModelURL()`." +
                "\n`newModelURL`: " + newModelURL + "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }

        Entities.editEntity(_this.entityID, {modelURL: newModelURL});
    }


    // UI
    function setActivePresenterUUID(id, args) {
        _this.activePresenterUUID = args[1];

        if (DEBUG) {
            console.log("boardButtonClient.js: " + _this.entityID + "`setActivePresenterUUID()`." +
                "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }

        updateModelURL();
    }


    // When the button is pressed, call the Smartboard zone server script to update the
    // current board state and send in the requested presenter if there is one
    function mousePressOnEntity() {
        if (DEBUG) {
            console.log("boardButtonClient.js: " + _this.entityID + ": `mousePressOnEntity()`." +
                "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }
        if (_this.activePresenterUUID && _this.activePresenterUUID !== MyAvatar.sessionUUID) {
            console.log ("returning");
            return;
        }
        console.log("calling update board");
        Entities.callEntityServerMethod(_this.screenshareZoneID,
            "updateCurrentBoardState", ["screenshare", MyAvatar.sessionUUID]);
    }


    // SMARTBOARD BUTTON OBJECT
    var _this;
    function SmartboardButtonClient() {
        _this = this;
        this.activePresenterUUID = "";
        this.screenshareZoneID;
        this.entityID;
        this.remotelyCallable = [
            "setActivePresenterUUID"
        ];
    }

    SmartboardButtonClient.prototype = {
        preload: preload,
        mousePressOnEntity: mousePressOnEntity,
        updateModelURL: updateModelURL,
        setActivePresenterUUID: setActivePresenterUUID
    };

    return new SmartboardButtonClient();
});