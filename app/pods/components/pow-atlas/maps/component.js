// Vendor
import {classNames, tagName} from '@ember-decorators/component';
import Component from '@ember/component';

@classNames('list-unstyled')
@tagName('ul')
export default class Component extends Component {
  currentMap = null;
  maps = null;
  onMapClick = () => {};
}
