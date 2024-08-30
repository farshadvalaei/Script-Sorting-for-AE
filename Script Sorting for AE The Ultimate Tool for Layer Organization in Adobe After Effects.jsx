function createMainUI(thisObj) {
    var mainPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "License & Tools", undefined, {resizeable: true});

    mainPanel.orientation = "column";
    mainPanel.alignChildren = ["fill", "top"];
    mainPanel.spacing = 10;
    mainPanel.margins = 10;

    var tabbedPanel = mainPanel.add("tabbedpanel");
    tabbedPanel.alignChildren = "fill";
    tabbedPanel.preferredSize = [400, 300];

   
    var tabActivate = tabbedPanel.add("tab", undefined, "Activate");
    tabActivate.orientation = "column";
    tabActivate.alignChildren = ["fill", "top"];
    tabActivate.margins = 10;

    tabActivate.add("statictext", undefined, "Enter your license key:");
    var licenseInput = tabActivate.add("edittext", undefined, "");
    licenseInput.characters = 40;
    var verifyButton = tabActivate.add("button", undefined, "Verify License");

    verifyButton.onClick = function() {
        var licenseKey = licenseInput.text;
        
      
        var licenseData = verifyLicense(licenseKey);
        if (licenseData && licenseData.success) {
            saveLicenseKey(licenseKey, licenseData.expiry_date);
            tabTools.enabled = true;
            tabActivate.enabled = false; 
            resetButton.enabled = true;  
            tabbedPanel.selection = tabTools;
            alert("License activated successfully! The interface is now locked.");
        } else {
            alert("Invalid License Key. Please try again.");
        }
    };


    var tabTools = tabbedPanel.add("tab", undefined, "Tools");
    tabTools.enabled = false;
    tabTools.orientation = "column";
    tabTools.alignChildren = ["fill", "top"];
    tabTools.margins = 10;

    var toolsGroup = tabTools.add("group");
    toolsGroup.orientation = "column";
    toolsGroup.alignChildren = "fill";
    toolsGroup.spacing = 10;

    toolsGroup.add("statictext", undefined, "Layer Sequence Tool:");
    toolsGroup.add("statictext", undefined, "Sequence Order:");
    var orderDropdown = toolsGroup.add("dropdownlist", undefined, ["Top to Bottom", "Bottom to Top"]);
    orderDropdown.selection = 0;

    var sequenceButton = toolsGroup.add("button", undefined, "Sequence Next Layer");
    var autoSequenceButton = toolsGroup.add("button", undefined, "Auto Sequence All Layers");

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
        openURL("https://farshadmind.in");
    };
    var linkButton = toolsGroup.add("button", undefined, "Update");
    linkButton.onClick = function() {
        openURL("https://farshadmind.in/product/script-sorting-for-ae-the-ultimate-tool-for-layer-organization-in-adobe-after-effects/");
    };

    var resetButton = mainPanel.add("button", undefined, "Reset License");
    resetButton.enabled = false; 
    resetButton.onClick = function() {
        clearLicenseKey();
        tabTools.enabled = false;    
        tabActivate.enabled = true;   
        resetButton.enabled = false; 
        tabbedPanel.selection = tabActivate;
        alert("License reset. Please enter a new license key.");
    };

 
    var savedLicenseKeyData = loadLicenseKey();
    if (savedLicenseKeyData) {
        var currentDate = new Date();
        var expiryDate = new Date(savedLicenseKeyData.expiryDate);

        if (expiryDate > currentDate && verifyLicense(savedLicenseKeyData.licenseKey).success) {
            tabTools.enabled = true;
            tabActivate.enabled = false;
            resetButton.enabled = true;
            tabbedPanel.selection = tabTools;
        } else {
            clearLicenseKey();
            tabbedPanel.selection = tabActivate;
            alert("Your license has expired or is invalid. Please activate a new license.");
        }
    } else {
        tabbedPanel.selection = tabActivate;
    }

    mainPanel.layout.layout(true);
    mainPanel.layout.resize();
    return mainPanel;
}


function verifyLicense(licenseKey) {
    try {
        var command = 'curl -s -X GET "https://farshadmind.in/wp-json/license/v1/verify/?license_key=' + encodeURIComponent(licenseKey) + '"';
        var result = system.callSystem(command);

        var jsonResponse = parseJSON(result);

        if (jsonResponse && jsonResponse.success) {
            return jsonResponse;
        } else {
            return null;
        }

    } catch (e) {
        alert("An error occurred: " + e.message);
        return null;
    }
}


function saveLicenseKey(licenseKey, expiryDate) {
    var file = new File(Folder.userData.fullName + "/license_key.txt");
    file.open("w");
    var data = {
        licenseKey: licenseKey,
        expiryDate: expiryDate
    };
    file.write(stringifyJSON(data));
    file.close();
}


function loadLicenseKey() {
    var file = new File(Folder.userData.fullName + "/license_key.txt");
    if (file.exists) {
        file.open("r");
        var fileContent = file.read();
        file.close();

        return parseJSON(fileContent);
    }
    return null;
}


function clearLicenseKey() {
    var file = new File(Folder.userData.fullName + "/license_key.txt");
    if (file.exists) {
        file.remove();
    }
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


function parseJSON(text) {
    try {
        var obj = eval('(' + text + ')');
        return obj;
    } catch (e) {
        alert("Failed to parse JSON: " + e.message);
        return null;
    }
}


function stringifyJSON(obj) {
    var str = '{';
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            str += '"' + key + '":"' + obj[key] + '",';
        }
    }
    str = str.slice(0, -1);
    str += '}';
    return str;
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
