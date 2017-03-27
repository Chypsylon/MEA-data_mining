var fs = require('fs');
var inventoryDefinitions = JSON.parse(fs.readFileSync('download/inventory_definitions-2017-03-24-09h30.json', 'utf8'));

var weaponsData = extractWeaponsData(inventoryDefinitions);
var weaponsCsvString = dataListToCsvString(weaponsData);

writeDataToCsvFile(weaponsCsvString, "weapons-" + (new Date()).toISOString() + ".csv");

var modsData = extractModsData(inventoryDefinitions);
var modsCsvString = dataListToCsvString(modsData);

writeDataToCsvFile(modsCsvString, "mods-" + (new Date()).toISOString() + ".csv");


function extractWeaponsData(inventoryDefinitions, categories) {
    categories = categories || ["1:SniperRifle", "1:AssaultRifle", "1:Pistol", "1:Shotgun"];

    var weapons = inventoryDefinitions.list.filter((x) => {
        return categories.indexOf(x.category) !== -1;
    });

    var baseHeaders = ["category", "locName", "rarity", "droppable", "cap", "locDescription"];

    var statsPerLevel = ["Base Damage Per Shot", "Encumbrance", "Magazine Size", "Rate of Fire", "Total Ammo", "UI Accuracy"];

    var statsHeaders = [];
    statsPerLevel.forEach((stat) => {
        for (var lvl = 1; lvl <= 10; lvl++) {
            statsHeaders.push(lvl + "_" + stat);
        }
    });

    var data = [baseHeaders.concat(statsHeaders)];

    weapons.forEach((weapon) => {
        var row = [];

        baseHeaders.forEach((x) => {
            row.push(weapon[x]);
        });

        statsHeaders.forEach((x) => {
            if (weapon.customAttributes.hasOwnProperty(x)) {
                row.push(weapon.customAttributes[x]);
            } else {
                row.push(" ");
            }
        });

        data.push(row);
    });

    return data;
}

function extractModsData(inventoryDefinitions, categories) {
    categories = categories || ['2:AssaultRifle', '2:Pistol', '2:Shotgun', '2:SniperRifle'];

    var mods = inventoryDefinitions.list.filter((x) => {
        return categories.indexOf(x.category) !== -1;
    });

    var baseHeaders = ["category", "locName", "rarity", "droppable", "cap", "locDescription"];

    var data = [];

    mods.forEach((mod) => {
        var modData = [];
        baseHeaders.forEach((header) => {
            modData.push([header, mod[header]]);
        });

        var attributes = Object.keys(mod.customAttributes).filter((attr) => {
            if (attr.includes("TextureId") || attr === "longDescription" || /^\d+$/.test(attr)) {
                return false;
            }
            return true;
        });

        var extraAttributes = new Set();

        attributes.forEach((attr) => {
            if (/^\d+_.+$/.test(attr)) {
                extraAttributes.add(attr.substring(attr.indexOf("_") +1));
            } else {
                modData.push([attr, mod.customAttributes[attr]]);
            }
        });

        var extraAttributesData = [];

        for (let attr of extraAttributes) {
            var lvlHeader = [];
            var lvlDataRow = []

            for (var lvl = 1; lvl <= 10; lvl++) {
                var attrLvl = lvl + "_" + attr;
                if (mod.customAttributes.hasOwnProperty(attrLvl)) {
                    lvlHeader.push(attrLvl);
                    lvlDataRow.push(mod.customAttributes[attrLvl]);
                }
            }

            extraAttributesData.push(lvlHeader);
            extraAttributesData.push(lvlDataRow);
        }

        for (var i = 0; i < extraAttributesData.length; i++) {
            modData[i] = modData[i].concat(extraAttributesData[i]);
        }

        modData.push([""]);
        modData.push([""]);
        modData.push([""]);

        data = data.concat(modData);
    });

    return data;
}

/**
 * Convert nested list of data to csv string. Cells are separeted by seperationChar and rows by \n
 * @param {[]} data
 * @param {String} seperationChar 
 */
function dataListToCsvString(data, seperationChar) {
    seperationChar = seperationChar || ';';

    return data.map((row) => {
        return row.map((cell) => {
            return '"' + ("" + cell).replace(/\"/g, '""', -1) + '"';
        }).join(seperationChar + ' ');
    }).join('\n');
}

function writeDataToCsvFile(data, fileName) {
    fs.writeFileSync(fileName, data);
}