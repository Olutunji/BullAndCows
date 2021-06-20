import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { BullsAndCows } from './components/BullsAndCows';
import { BullAndCow } from './components/BullAndCow';
import { ComputerPlay } from './components/ComputerPlay';

import './custom.css'

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        <Route exact path='/' component={BullsAndCows} />
        <Route path='/bulls-and-cows' component={BullAndCow} />
        <Route path='/com-play' component={ComputerPlay} />
      </Layout>
    );
  }
}
