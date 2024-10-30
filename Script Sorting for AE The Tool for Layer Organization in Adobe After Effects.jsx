// Script Sorting for AE The Tool for Layer Organization in Adobe After Effects
// Version: 1.0.1
// Author and Maintainer: Farshad Valaei
// This script is designed for managing licenses and providing useful tools for Adobe After Effects compositions.
// Developed with the assistance of AI's language models.
// Learn how to use this script on YouTube: https://www.youtube.com/@farshadvalaei
// How to Updates this script on Website: https://farshadvalaei.eu



function createMainUI(thisObj) {
    var mainPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Sorting tools", undefined, {resizeable: true});

    mainPanel.orientation = "column";
    mainPanel.alignChildren = ["fill", "top"];
    mainPanel.spacing = 10;
    mainPanel.margins = 10;

    var tabbedPanel = mainPanel.add("tabbedpanel");
    tabbedPanel.alignChildren = "fill";
    tabbedPanel.preferredSize = [400, 300];


var tabTools = tabbedPanel.add("tab", undefined, "Tools");
    tabTools.orientation = "column";
    tabTools.alignChildren = ["fill", "top"];
    tabTools.margins = 10;

    var toolsGroup = tabTools.add("group");
    toolsGroup.orientation = "column";
    toolsGroup.alignChildren = "fill";
    toolsGroup.spacing = 10;

    toolsGroup.add("statictext", undefined, "Layer Sequence Tool:");
    toolsGroup.add("statictext", undefined, "Sequence Order:");
    var orderDropdown = toolsGroup.add("dropdownlist", undefined, ["Top to Down", "Down to Top"]);
    orderDropdown.selection = 0;

    var sequenceButton = toolsGroup.add("button", undefined, "Manual Layer");
    var autoSequenceButton = toolsGroup.add("button", undefined, "Auto Layers");

    sequenceButton.onClick = function() {
        var order = orderDropdown.selection.index === 0 ? "topToBottom" : "bottomToTop";
        sequenceNextLayer(order);
    };

    autoSequenceButton.onClick = function() {
        var order = orderDropdown.selection.index === 0 ? "topToBottom" : "bottomToTop";
        autoSequenceAllLayers(order);
    };

    toolsGroup.add("panel", undefined, "About this Script");
    var aboutText = toolsGroup.add("statictext", undefined, "This script helps you sequence layers in your composition.");
    aboutText.alignment = ["fill", "top"];
    toolsGroup.add("statictext", undefined, "Created by: Farshad Valaei");
    toolsGroup.add("statictext", undefined, "Version: 1.0.1");

    var linkButton = toolsGroup.add("button", undefined, "YouTube");
    linkButton.onClick = function() {
        openURL("https://youtube.com/@farshadvalaei?si=xokOb9PNaCJu6nwm");
    };
    var youtubeButton = toolsGroup.add("button", undefined, "All Scripts");
    youtubeButton.onClick = function() {
        openURL("https://farshadvalaei.eu");
    };
    var updateButton = toolsGroup.add("button", undefined, "Update");
    updateButton.onClick = function() {
        openURL("https://farshadvalaei.eu/product/script-sorting-for-ae-the-tool-for-layer-organization-in-adobe-after-effects/");
    };

    tabbedPanel.selection = tabTools;

    mainPanel.layout.layout(true);
    mainPanel.layout.resize();
    return mainPanel;
}


function sequenceNextLayer(order) {
    var comp = app.project.activeItem;

    if (!(comp && comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    var selectedLayers = comp.selectedLayers;
    if (selectedLayers.length !== 1) {
        alert("Please select exactly one layer.");
        return;
    }

    var currentLayer = selectedLayers[0];
    var layerIndex = currentLayer.index;

    var nextLayer = null;
    if (order === "topToBottom") {
        for (var i = layerIndex + 1; i <= comp.layers.length; i++) {
            var potentialNextLayer = comp.layer(i);
            if (potentialNextLayer.enabled && !potentialNextLayer.isNull && !potentialNextLayer.guideLayer) {
                nextLayer = potentialNextLayer;
                break;
            }
        }
    } else if (order === "bottomToTop") {
        for (var i = layerIndex - 1; i >= 1; i--) {
            var potentialNextLayer = comp.layer(i);
            if (potentialNextLayer.enabled && !potentialNextLayer.isNull && !potentialNextLayer.guideLayer) {
                nextLayer = potentialNextLayer;
                break;
            }
        }
    }

    if (!nextLayer) {
        alert("No more valid layers to sequence.");
        return;
    }

    app.beginUndoGroup("Sequence Next Layer");

    var startTimeOffset = nextLayer.inPoint - nextLayer.startTime;
    nextLayer.startTime = currentLayer.outPoint - startTimeOffset;

    var compDuration = comp.duration;
    var newTime = nextLayer.startTime + (nextLayer.outPoint - nextLayer.inPoint);

    if (newTime < 0) {
        newTime = 0;
    } else if (newTime > compDuration) {
        newTime = compDuration;
    }

    comp.time = newTime;

    currentLayer.selected = false;
    nextLayer.selected = true;

    app.endUndoGroup();
}

function autoSequenceAllLayers(order) {
    var comp = app.project.activeItem;

    if (!(comp && comp instanceof CompItem)) {
        alert("Please select a composition.");
        return;
    }

    app.beginUndoGroup("Auto Sequence All Layers");

    if (order === "topToBottom") {
        for (var i = 1; i <= comp.layers.length; i++) {
            var currentLayer = comp.layer(i);
            if (currentLayer.enabled && !currentLayer.isNull && !currentLayer.guideLayer) {
                for (var j = i + 1; j <= comp.layers.length; j++) {
                    var nextLayer = comp.layer(j);
                    if (nextLayer.enabled && !nextLayer.isNull && !nextLayer.guideLayer) {
                        var startTimeOffset = nextLayer.inPoint - nextLayer.startTime;
                        nextLayer.startTime = currentLayer.outPoint - startTimeOffset;
                        break;
                    }
                }
            }
        }
    } else if (order === "bottomToTop") {
        for (var i = comp.layers.length; i > 1; i--) {
            var currentLayer = comp.layer(i);
            if (currentLayer.enabled && !currentLayer.isNull && !currentLayer.guideLayer) {
                for (var j = i - 1; j >= 1; j--) {
                    var nextLayer = comp.layer(j);
                    if (nextLayer.enabled && !nextLayer.isNull && !nextLayer.guideLayer) {
                        var startTimeOffset = nextLayer.inPoint - nextLayer.startTime;
                        nextLayer.startTime = currentLayer.outPoint - startTimeOffset;
                        break;
                    }
                }
            }
        }
    }

    app.endUndoGroup();
}

function openURL(url) {
    var command = "explorer ";
    if ($.os.indexOf("Mac") !== -1) {
        command = "open ";
    }
    command += "\"" + url + "\"";
    system.callSystem(command);
}


var myScriptUI = createMainUI(this);

if (myScriptUI && myScriptUI instanceof Window) {
    myScriptUI.center();
    myScriptUI.show();
} else if (myScriptUI instanceof Panel) {
    myScriptUI.layout.layout(true);
    myScriptUI.layout.resize();
} else {
    alert("Failed to create the UI.");
}
