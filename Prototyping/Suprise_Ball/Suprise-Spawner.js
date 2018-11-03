//
// spaceJuiceSpawner.js
// 
// Author: Rebecca Stankus on 05/02/18
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global Pointers */

(function() { 
    var _this;

    var SEARCH_RADIUS = 10;
    var SPAWN_CHECK_MS = 2500;

    var LIFETIME = 60;

    function SupriseSpanwer() {
        _this = this;
    }

    SupriseSpanwer.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.position = Entities.getEntityProperties(_this.entityID, 'position').position;
            Script.setInterval(function() {
                _this.spawnIfNeeded();
            }, SPAWN_CHECK_MS);
        },

        spawnIfNeeded: function() {
            var needToSpawn = true;
            Entities.findEntities(_this.position, SEARCH_RADIUS).forEach(function(element) {
                var name= Entities.getEntityProperties(element, 'name').name;
                if (name === "Suprise-Ball!") {
                    needToSpawn = false;
                }
            });
            if (needToSpawn) {
                _this.spawnBall();
            }
        },

        spawnBall: function() {
            var ball = Entities.addEntity({
                position: _this.position,
                "clientOnly": false,
                "collisionsWillMove": true,
                "color": {
                    "blue": 0,
                    "green": 0,
                    "red": 255
                },
                "created": "2018-10-29T12:17:34Z",
                "dimensions": {
                    "blue": 0.3499999940395355,
                    "green": 0.3499999940395355,
                    "red": 0.3499999940395355,
                    "x": 0.3499999940395355,
                    "y": 0.3499999940395355,
                    "z": 0.3499999940395355
                },
                "dynamic": true,
                "gravity": {
                    "blue": 0,
                    "green": -9.800000190734863,
                    "red": 0,
                    "x": 0,
                    "y": -9.800000190734863,
                    "z": 0
                },
                "id": "{be4b084c-859c-4571-ad35-3d3a6dbc1dca}",
                "lastEdited": 1540816406033489,
                "lastEditedBy": "{32aed6cd-d501-4289-9f89-2dbc7c1a6009}",
                "name": "Suprise-Ball!",
                "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
                "queryAACube": {
                    "scale": 0.6062177419662476,
                    "x": -0.3031088709831238,
                    "y": -0.3031088709831238,
                    "z": -0.3031088709831238
                },
                "rotation": {
                    "w": 0.037644028663635254,
                    "x": 0.8319370746612549,
                    "y": 0.08461129665374756,
                    "z": -0.547051191329956
                },
                "script": "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/Prototyping/Suprise_Ball/Suprise-Ball.js?" + Date.now(),
                "type": "Sphere",
                "userData": "{\"grabbableKey\":{\"grabbable\":true}}"
            }, true);

            Entities.addEntity({
                "clientOnly": false,
                "created": "2018-10-29T12:19:45Z",
                "id": "{f408f577-6b66-4acd-a1a2-c2d4190d59bf}",
                "lastEdited": 1540816404771470,
                "lastEditedBy": "{32aed6cd-d501-4289-9f89-2dbc7c1a6009}",
                "materialData": "{\n  \"materialVersion\": 1,\n  \"materials\": {\n    \"albedoMap\": \"https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/Prototyping/Suprise_Ball/question.png\",\n    \"emissiveMap\": \"https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/Prototyping/Suprise_Ball/question.png\"\n  }\n}",
                "materialMappingScale": {
                    "x": 7,
                    "y": 7
                },
                "materialURL": "materialData",
                "name": "Suprise-Ball-Material",
                "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
                "parentID": ball,
                "priority": 1,
                "queryAACube": {
                    "scale": 0.17320507764816284,
                    "x": 95.96235656738281,
                    "y": 10.319595336914062,
                    "z": 85.14569091796875
                },
                "rotation": {
                    "w": 1,
                    "x": -1.52587890625e-05,
                    "y": -1.52587890625e-05,
                    "z": -1.52587890625e-05
                },
                "type": "Material"
            }, true);
        }
    };

    return new SupriseSpanwer();
});
