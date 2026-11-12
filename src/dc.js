import { Component } from "react";

/* Base class for the generated screens. The design tool's screens are written
   against this small API: this.state / this.setState, lifecycle methods, and
   renderVals() returning the values the markup reads. */
export class DCLogic extends Component {
  constructor(props) {
    super(props);
    if (!this.state) this.state = {};
  }

  vals() {
    const v = typeof this.renderVals === "function" ? this.renderVals() : null;
    return { ...(this.props || {}), ...(v || {}) };
  }
}
