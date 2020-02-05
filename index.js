const path = require('path');
const fs = require('fs');

const sourceArguements = process.argv || [];
const sources = sourceArguements.slice(2, sourceArguements.length - 1) // remove node and the script
const outDir = sourceArguements[sourceArguements.length - 1] // remove node and the script

if(sources.length < 2) {
    console.error('You have to provide at least two source directories on the command line along with an output folder.');
    return;
}

console.log(`Sources: ${sources}`);
console.log(`Out: ${outDir}`);

const base = sources[0];
const others = sources.slice(1);

const baseCharacters = fs.readdirSync(base)

for (const characterPath of baseCharacters) {
    const fullpath = path.join(base, characterPath)

    let characterData = JSON.parse(
        fs.readFileSync(fullpath)
    );

    const othersToBeMerged = others.map((otherDir) => {
        return JSON.parse(
            fs.readFileSync(`${otherDir}/${characterPath}`)
        )
    });    

    const otherHomes = [].concat(
        characterData.homes || [],
        ...(othersToBeMerged.map((char) => char.homes || []))
    );

    // Find duplicates using the bucket hash algorithim
    const marked = {};
    let neverGoingToGiveYouUp = 1;

    for (const house of otherHomes) {
        // Iterate over each house key
        for (const key in house) {
            const houseDataItem = house[key];

            // We already saw it marked on this run
            if(marked[key]) {
                house[key + neverGoingToGiveYouUp++] = houseDataItem;
                delete house[key];
            }

            marked[key] = true; // mark it as sweeped            
        }
    }

    // Merge them together
    Object.assign(characterData.homes, ...otherHomes)

    console.log(`Writing ${characterPath}...`);
    fs.writeFileSync(path.join(outDir, characterPath), JSON.stringify(characterData, null, 4))
}