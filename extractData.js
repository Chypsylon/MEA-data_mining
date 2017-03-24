var fs = require('fs');
var inventoryDefinitions = JSON.parse(fs.readFileSync('download/inventory_definitions-2017-03-24-09h30.json', 'utf8'));

var weaponsData = extractWeaponsData(inventoryDefinitions);
var weaponsCsvString = dataListToCsvString(weaponsData);

var fileName = "weapons-" + (new Date()).toISOString() + ".csv";
writeDataToCsvFile(weaponsCsvString, fileName);

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

    weapons.forEach((element) => {
        var row = [];

        baseHeaders.forEach((x) => {
            row.push(element[x]);
        });

        statsHeaders.forEach((x) => {
            if (element.customAttributes.hasOwnProperty(x)) {
                row.push(element.customAttributes[x]);
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

    //TODO: better to extract the stat headers directly from the customAttributes json and blacklist unwanted keys (e.g. UnlockedTextureId, LockedTextureId, 1 ... 10, longDescription)
    
    var extraAttributesHeaders = ["itemPartType"];

    var statsPerLevel = ["Base Weapon Damage", "Weapon Damage", "Base Clip Size", "Clip Size", "Base Penetration Damage", "Penetration Damage Mod", "Base Penetration Distance", "Penetration Distance", "Base Weapon Accuracy", "Weapon Accuracy", "Base Weapon Stabolity", "Weapon Stability", "Base Melee Damage", "Melee Damage", "Base Pellet Spread", "Pellet Spread", "Base Max Ammo", "Max Ammo", "Base Encumbrance Reduction", "Encumbrance Reduction"];

    var statsHeaders = [];
    statsPerLevel.forEach((stat) => {
        for (var lvl = 1; lvl <= 10; lvl++) {
            statsHeaders.push(lvl + "_" + stat);
        }
    });
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