import Component from "./component";

export default class UICustomComponent extends Component {
   constructor(App, componentKey) {
      super(App, componentKey);

      // Save our definition into App.custom.[key]
      App.custom = App.custom || {};
      App.custom[componentKey] = this;
   }
}
