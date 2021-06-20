import React, { Component } from 'react';

export class BullsAndCows extends Component {
  static displayName = BullsAndCows.name;

  constructor(props) {
    super(props);
    this.state = {
      guessCount: 0,
      guessValue: '',
      result: null,
      plays: [],
      gameOver: false
    };

    this.validateGuess = this.validateGuess.bind(this);
    this.startNewGame = this.startNewGame.bind(this);
  }

  render() {
    const { guessCount, guessValue, plays, gameOver } = this.state;

    return (
      <div className="bac-page">
        <div className="row">
          <div className="col-7">
            <div className="row">
                <div className="col-12">
                  <form onSubmit={ this.validateGuess }>
                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label mt5">Please, enter a 4 digit numeric non-zero(0) guess:</label>
                        <input
                          type="text"
                          className="form-control"
                          id="guessValue"
                          name="guess"
                          value={ guessValue }
                          onChange={ (event) => this.setState({ guessValue: event.target.value }) }>
                        </input>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <input className="btn btn-primary" type="submit" value="Check!" disabled={gameOver}></input>
                        <input className="btn btn-secondary" type="button" value="Clear Result" onClick={() => this.setState({ plays: [] })}></input>
                        <input className="btn btn-success" type="button" value="Start a new game" onClick={ this.startNewGame }></input>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="col-12 mb5">You have made <b>{guessCount}</b> attempt(s)</div>
                <div className="col-12">
                  <div className="display-box mb5 ml5">
                    { gameOver && "Game over !!!" }
                    { plays.map((x, index) => {
                      return(
                      <div className="ml5" key={index}>
                        {x}
                        <br />
                      </div>);
                      })
                    }
                  </div>
                </div>
              </div>
          </div>
          <div className="col-5 information">
            <div className="section">
              <h4 className="topic">How to Play</h4>
              <span>
                The goal of the game is to uncover the computer generated secret number as quick as possible. If your guess has matching digits on the exact places as the secret, they are Bulls. If you have digits from the secret number but not on the right places, they are Cows. The goal is to get 4 Bulls!
              </span>
            </div>
            <div className="section mt20">
              <h4 className="topic">Instructions</h4>
              <ul>
                <li>Only numeric numbers are allowed</li>
                <li>The numbers must be all different, no repetition</li>
                <li>The number zero(0) is not allowed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  displayResult() {
    
  }

  addToPlay(entry) {
    const { plays } = this.state;
    plays.unshift(entry);
    this.setState({ plays });
  }

  processResult(data) {
    if(data != null) {
      let entry = null;

      if (data.message === null) {
        entry = `${data.guess} => bulls ${data.bulls}, cows ${data.cows}`;
        this.setState({ result: data, gameOver: data.strike });
      } else {
        entry = `Message: ${data.message}`;
      }

      this.addToPlay(entry);
    }
    return null;
  }

  async validateGuess(event) {
    event.preventDefault();
    const { guessValue, guessCount } = this.state;
    
    this.setState({ guessCount : guessCount + 1 });
    const response = await fetch(`bullsandcows/validateguess?guess=${ guessValue }`);
    const data = await response.json();

    this.processResult(data);
    this.addToPlay(`-> ${ guessValue }`);
  }

  async startNewGame(event) {
    event.preventDefault();

    const response = await fetch("bullsandcows/restartgame");
    const data = await response.json();

    if (data === true) {
      this.setState({ plays: [], result: null, gameOver: false, guessValue:'', guessCount: 0 });
    }
  }
}