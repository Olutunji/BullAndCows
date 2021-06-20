import React, { useState } from 'react'
import { PropTypes } from 'prop-types';

export const ComputerPlay = () => {
  const defaultResult = {
    "guess": "",
    "bulls": 0,
    "cows": 0,
    "message": null
  }
  const [plays, SetPlays] = useState([]);
  const [guessCount, SetGuessCount] = useState(0);
  const [gameOver, SetGameOver] = useState(false);
  const [secret, SetSecret] = useState('');
  const [result, SetResult] = useState(defaultResult);
  const [lockSecret, SetLockSecret] = useState(false);

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
      SetResult(data);
    }
    return null;
  }

  const buildResult = (guess, bulls, cows, message) => {
    const result = {
      "guess": guess,
      "bulls": bulls,
      "cows": cows,
      "message": message,
      "strike": bulls === 4
    };
    return result;
  }

  const computeBulls = (array1, array2) => {
    let bulls = 0
    for (let index = 0; index < array1.length; index++) {
      if (array1[index] === array2[index]) {
        bulls = bulls + 1;
      }
    }

    return bulls;
  }

  const isUnique = (str) => {
    var obj = {};
    for (var z = 0; z < str.length; ++z) {
      var ch = str[z];
      if (obj[ch]) return false;
      obj[ch] = true;
    }
    return true;
  }

  const validateSecret = () => {

    let valid = true;
    let result = null;
    if (secret.length !== 4) {
      result = buildResult("", 0, 0, "Please, ensure secret is 4 characters long");
      valid = false;
    }

    if (valid && isUnique(secret) === false) {
      result = buildResult("", 0, 0, "Please, ensure secret does not contain duplicate characters");
      valid = false;
    }

    if (valid && secret.indexOf('0') > -1) {
      result = buildResult("", 0, 0, "Please, ensure secret does not contain zero(0) character");
      valid = false;
    }

    if(valid) {
      SetLockSecret(true);
      return true;
    } else {
      processResult(result);
      return false;
    }
  }
  
  const validateGuess = async(event) => {
    event.preventDefault();
    let tempResult = buildResult("", 0, 0, null);
    
    // Validation of secret
    if (lockSecret === false && validateSecret() === false) {
      return;
    }
    
    SetGuessCount(guessCount + 1);
    const response = await fetch(`bullsandcows/compute?guesscount=${ guessCount }&guess=${ result.guess }&bulls=${ result.bulls }&cows=${ result.cows }`);
    const data = await response.json();
    
    if (data === secret) {
      tempResult = buildResult(data, 4, 0, null);
      SetLockSecret(false);
    }

    const secretArray = secret.split('');
    const guessArray = data.toString().split('');

    const bulls = computeBulls(secretArray, guessArray);
    const cows = secretArray.filter(value => guessArray.includes(value));
    tempResult = buildResult(data, bulls, (cows.length - bulls), null)
  
    processResult(tempResult);
    addToPlay(`-> ${ data }`);
  }

  const startNewGame = () => {
    SetSecret('');
    SetPlays([]);
    SetGameOver(false);
    SetLockSecret(false)
    SetGuessCount(0);
  }
  
  return (
    <div className="bac-page">
      <div className="row">
        <div className="col-7">
          <div className="row">
            <div className="col-12 mt5 ml5">
              <label className="form-label">Please, enter a secret number:</label>
              &nbsp;
              <input
                type="text"
                id="secret"
                name="secret"
                disabled={lockSecret}
                value={ secret }
                onChange={ (event) => SetSecret(event.target.value) }>
              </input>
            </div>
          </div>
          <div className="row mt5">
            <div className="col-12">
              <input className="btn btn-primary" type="submit" value="Check!" disabled={gameOver} onClick={ event => validateGuess(event)}></input>
              <input className="btn btn-secondary" type="button" value="Clear Result" onClick={ () => SetPlays([]) }></input>
              <input className="btn btn-success" type="button" value="Start a new game" onClick={ () => startNewGame() }></input>
            </div>
          </div>
          <div className="row mt5">
            <div className="col-12 mb5 ml5">Computer has made <b>{guessCount}</b> attempt(s)</div>
          </div>
          <div className="row">
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

ComputerPlay.propTypes = {
  result: PropTypes.shape(),
}

ComputerPlay.defaultProp = {
  
}