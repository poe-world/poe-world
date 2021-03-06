import EmberObject from '@ember/object';
import {computed} from '@ember-decorators/object';
import {equal, and} from '@ember-decorators/object/computed';

// Constants
const YELLOW_TIER_MIN_TIER = 6;
const RED_TIER_MIN_TIER = 11;
const UNIQUE_RARITY = 'unique';
const ESTIMATED_SEXTANT_RANGE = 230;

export default class AtlasMap extends EmberObject {
  id = null;
  name = null;
  wikiUrl = null;
  imageUrl = null;
  areaLevel = null;
  tier = null;
  type = null;
  layoutRating = null;
  bossRating = null;
  tileset = null;
  drops = null;
  offsetLeft = null;
  offsetTop = null;
  sextants = null;
  isTradable = true;
  pantheon = null;

  constructor(props) {
    super(props);
    this.setProperties(props);
  }

  isInSextantRangeOf(map) {
    const distance = Math.sqrt(
      Math.pow(this.offsetLeft - map.offsetLeft, 2) + Math.pow(this.offsetTop - map.offsetTop, 2)
    );

    return distance <= ESTIMATED_SEXTANT_RANGE;
  }

  @and('offsetLeft', 'offsetTop')
  hasOffsets;

  @equal('type', UNIQUE_RARITY)
  isUnique;

  @computed('sextants')
  get confirmedSextants() {
    return this.sextants.filter(map => this.isInSextantRangeOf(map));
  }

  @computed('sextants')
  get potentialSextants() {
    return this.sextants.filter(map => !this.isInSextantRangeOf(map));
  }

  @computed('tier')
  get tierColor() {
    const tier = this.tier;

    if (!tier) return null;

    if (tier >= RED_TIER_MIN_TIER) return 'red';
    if (tier >= YELLOW_TIER_MIN_TIER) return 'yellow';
    return 'white';
  }

  @computed('name', 'isUnique')
  get tradeName() {
    const {name, isUnique} = this;
    if (isUnique) return name;

    return `${name} Map`;
  }
}
