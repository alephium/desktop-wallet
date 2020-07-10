import React, { Component } from "react";

class Step extends Component {
  constructor(pos) {
    super();
    this.pos = pos;
  }

  render() {
    if (this.props.step !== this.pos) {
      return null;
    } 
    return this.renderStep();
  }

}

class Wizard extends Component {
  constructor() {
    super();
    this.state = {
      step: 1
    };
    this.next = this.next.bind(this); 
    this.back = this.back.bind(this); 
  }

  next() {
    this.setState({
      step: this.state.step + 1,
    });
  }
  
  back() {
    this.setState({
      step: this.state.step - 1,
    });
  }
}

export {
  Step,
  Wizard
}
