import React, { useState } from 'react'

export const BullAndCow = ({}) => {
  const [plays, SetPlays] = useState([]);
  const [guessCount, SetGuessCount] = useState(0);
  const [gameOver, SetGameOver] = useState(false);
  const [guessValue, SetGuessValue] = useState('');

  const addToPlay = (entry) => {
    plays.unshift(entry);
    SetPlays(plays);
  }
  
  const processResult = (data) => {
    if(data != null) {
      let entry = null;
  
      if (data.message === null) {
        entry = `${data.guess} => bulls ${data.bulls}, cows ${data.cows}`;
        SetGameOver(data.strike);
      } else {
        entry = `Message: ${data.message}`;
      }
  
      addToPlay(entry);
    }
    return null;
  }
  
  const validateGuess = async(event) => {
    event.preventDefault();
    
    SetGuessCount(guessCount + 1)
    const response = await fetch(`bullsandcows/validateguess?guess=${ guessValue }`);
    const data = await response.json();
  
    processResult(data);
    addToPlay(`-> ${ guessValue }`);
  }
  
  const startNewGame = async(event) => {
    event.preventDefault();
  
    const response = await fetch("bullsandcows/restartgame");
    const data = await response.json();

    if (data === true) {
      SetPlays([]);
      SetGameOver(false);
      SetGuessCount(0);
    }
  }
  
  return (
    <div className="bac-page">
      <div className="row">
        <div className="col-7">
          <div className="row">
              <div className="col-12">
                <form onSubmit={ event => validateGuess(event) }>
                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label mt5">Please, enter a 4 digit numeric non-zero(0) guess:</label>
                      <input
                        type="text"
                        className="form-control"
                        id="guessValue"
                        name="guess"
                        value={ guessValue }
                        onChange={ event => SetGuessValue(event.target.value) }>
                      </input>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <input className="btn btn-primary" type="submit" value="Check!" disabled={gameOver}></input>
                      <input className="btn btn-secondary" type="button" value="Clear Result" onClick={ () => SetPlays([]) }></input>
                      <input className="btn btn-success" type="button" value="Start a new game" onClick={ event => startNewGame(event) }></input>
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

