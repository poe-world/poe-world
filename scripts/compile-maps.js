const fs = require('fs');

// Cli params
const CLI_OVERRIDES = process.argv.length >= 3 ? JSON.parse(process.argv[2]) : {};

// Constants
const MAPS_PATH = './maps';
const WIKI_MAPS_PATH = './maps/_wiki.json';
const OUTPUT_ES6_PATH = './app/constants/maps.js';
const BASE_OVERRIDE = {
  offsetLeft: 0,
  offsetTop: 0
};

// Utils
const loadJsonFrom = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));

const mapDistance = (mapA, mapB) => {
  const dxSquare = Math.pow(Math.abs(mapB.offsetLeft - mapA.offsetLeft), 2);
  const dySquare = Math.pow(Math.abs(mapB.offsetTop - mapA.offsetTop), 2);
  return Math.sqrt(dxSquare + dySquare);
};

const computeSextantsFor = (map, availableMaps) => {
  if (!availableMaps.includes(map)) return [];
  if (map.sextantCoverage === 1) return [map.id];

  const mapDistances = availableMaps.map((comparedMap) => ({
    id: comparedMap.id,
    distance: mapDistance(map, comparedMap)
  }));

  return mapDistances
    .sort(({distance: distanceA}, {distance: distanceB}) => distanceA - distanceB)
    .slice(0, map.sextantCoverage)
    .map(({id}) => id);
};

if (!fs.existsSync(WIKI_MAPS_PATH)) throw 'You need to "npm run fetch-maps-wiki" first to download the maps from the wiki.';

const wikiMaps = loadJsonFrom(WIKI_MAPS_PATH);

console.log('Assembling maps...')
const preProcessedMaps = Object.keys(wikiMaps).reduce((preProcessedMaps, mapId) => {
  const currentMapOverridePath = `${MAPS_PATH}/${mapId}.json`;
  const wikiMap = wikiMaps[mapId];

  let currentOverride = fs.existsSync(currentMapOverridePath) ? loadJsonFrom(currentMapOverridePath) : {};

  currentOverride = {
    ...BASE_OVERRIDE,
    ...currentOverride,
    ...CLI_OVERRIDES[mapId]
  };

  fs.writeFileSync(currentMapOverridePath, JSON.stringify(currentOverride, Object.keys(currentOverride).sort(), 2));

  preProcessedMaps[mapId] = {
    ...wikiMap,
    ...currentOverride
  };

  return preProcessedMaps;
}, {});

console.log('Computing maps...');
const sextantAvailableMaps = Object.values(preProcessedMaps).filter(({type}) => !/(unique|special)/.test(type));
const processedMaps = Object.keys(preProcessedMaps).reduce((processedMaps, mapId) => {
  const processedMap = preProcessedMaps[mapId];

  processedMaps[mapId] = {
    ...processedMap,
    sextants: computeSextantsFor(processedMap, sextantAvailableMaps)
  };

  return processedMaps;
}, {});

console.log('Writing the output...');
fs.writeFileSync(OUTPUT_ES6_PATH, `export default ${JSON.stringify(processedMaps, null, 2)};`);
console.log('Good luck with your maps !');
