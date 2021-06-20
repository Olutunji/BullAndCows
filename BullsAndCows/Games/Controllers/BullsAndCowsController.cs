using System;
using System.Collections.Generic;
using System.Linq;
using Games.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Games.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class BullsAndCowsController : ControllerBase
    {
        private readonly ILogger<BullsAndCowsController> _logger;
        private readonly ApplicationSettings _appSettings;
        private readonly char _zero = Convert.ToChar("0");
        private static string _valueToGuess;

        private static List<int> _ignoreList = new List<int>();
        private static List<int> _potentialList = new List<int>();
        private static List<int> _confirmedList = new List<int>();
        private Dictionary<int, int[]> _map = new Dictionary<int, int[]>();
        private static Dictionary<string, (int, int)> _resultDictionary = new Dictionary<string, (int, int)>();

        public BullsAndCowsController(ApplicationSettings appSettings, ILogger<BullsAndCowsController> logger, string valueToGuess = null)
        {
            _appSettings = appSettings;
            _logger = logger;

            if (_valueToGuess == null)
            {
                GenerateRandomNumber();
            }

            _map.Add(1, new[] { 1, 2, 3, 4 });
            _map.Add(2, new[] { 2, 3, 4, 5 });
            _map.Add(3, new[] { 3, 4, 5, 6 });
            _map.Add(4, new[] { 4, 5, 6, 7 });
            _map.Add(5, new[] { 5, 6, 7, 8 });
            _map.Add(6, new[] { 6, 7, 8, 9 });

            // For purpose of unit test
            if (valueToGuess != null)
            {
                _valueToGuess = valueToGuess; 
            }
        }

        [HttpGet]
        [Route("validateguess")]
        public GuessResult ValidateGuess(string guess)
        {
            (int bulls, int cows, string message) = EvaluateGuess(guess);

            GuessResult result = new GuessResult
            {
                Guess = guess,
                Bulls = bulls,
                Cows = cows,
                Message = message
            };

            return result;
        }

        [HttpGet]
        [Route("restartgame")]
        public bool RestartGame()
        {
            try
            {
                _valueToGuess = "";
                GenerateRandomNumber();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return false;
            }
            
        }

        [HttpGet]
        [Route("compute")]
        public string Compute(int guessCount, string guess, int bulls, int cows)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(guess))
                {
                    return "9876";
                }

                return EvaluateGuess(guessCount, guess, bulls, cows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }

        #region Private Methods

        private string EvaluateGuess(int guessCount, string guess, int bulls, int cows)
        {
            if (bulls == 0 && cows == 0)
            {
                _ignoreList.AddRange(GetListFromString(guess));
            }

            if (!_resultDictionary.ContainsKey(guess))
            {
                _resultDictionary.Add(guess, (bulls, cows));
            }

            // If exist where all 4 digit are obtained
            if (_resultDictionary.Values.ToList().Exists(t => (t.Item1 + t.Item2) == 4))
            {
                string digits = _resultDictionary.FirstOrDefault(m => (m.Value.Item1 + m.Value.Item2) == 4).Key;
                _confirmedList.AddRange(GetListFromString(digits));
            }

            if (_resultDictionary.Values.ToList().Exists(t => (t.Item1 + t.Item2) == 3))
            {
                foreach (KeyValuePair<string, (int, int)> resultPair in _resultDictionary.OrderByDescending(t => t.Value.Item1))
                {
                    if (resultPair.Value.Item1 + resultPair.Value.Item2 == 3)
                    {
                        List<int> potential = GetListFromString(resultPair.Key);
                        _potentialList.AddRange(potential.Except(_ignoreList));
                    }
                }
            }

            if (_map.ContainsKey(guessCount))
            {
                return GetStringFromArray(_map[guessCount]);
            }

            foreach (KeyValuePair<string, (int, int)> resultPair1 in _resultDictionary.OrderByDescending(t => t.Value.Item1))
            {
                if (resultPair1.Value.Item2 == 2)
                {
                    List<int> potentialItem1 = GetListFromString(resultPair1.Key);

                    foreach (KeyValuePair<string, (int, int)> resultPair2 in _resultDictionary.OrderByDescending(t => t.Value.Item2))
                    {
                        if (resultPair2.Value.Item2 == 2)
                        {
                            List<int> potentialItem2 = GetListFromString(resultPair2.Key);
                            _potentialList.AddRange((potentialItem1.Intersect(potentialItem2)).Except(_ignoreList));
                        }
                    }
                }
            }

            _potentialList = _potentialList.Distinct().ToList();


            return null;

        }

        //private string GenarateRandomFromList(List<int> sourceList)
        //{
        //    return null;
        //}

        private string GetStringFromArray(int[] arrayChars)
        {
            string returnString = "";
            foreach (int value in arrayChars)
            {
                returnString += value.ToString();
            }

            return returnString;
        }

        private List<int> GetListFromString(string stringValue)
        {
            List<int> list = new List<int>();
            foreach (char charValue in stringValue)
            {
                if (int.TryParse(charValue.ToString(), out int intValue))
                {
                    list.Add(intValue);
                }
                
            }

            return list;
        }

        private void GenerateRandomNumber()
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(_valueToGuess))
                {
                    return;
                }

                int count = 0;
                Random rnd = new Random();
                List<string> randomNumbers = new List<string>();

                while (count < _appSettings.GuessCharCount)
                {
                    string randomNumber = rnd.Next(1, 9).ToString();
                    if (!randomNumbers.Contains(randomNumber))
                    {
                        randomNumbers.Add(randomNumber);
                        count++;
                    }
                }

                _valueToGuess = randomNumbers.Aggregate((i, j) => i + j);

                _logger.Log(LogLevel.Information, $"Secret number generated at {DateTime.UtcNow} is {_valueToGuess}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            }
        }

        private (int, int, string) EvaluateGuess(string guessValue)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(guessValue))
                {
                    return (0, 0, "Please, specify a 4 digit number. Zero(0) not allowed");
                }

                if (_valueToGuess == guessValue)
                {
                    return (4, 0, null);
                }

                if (!int.TryParse(guessValue, out int _))
                {
                    return (0, 0, "Only numeric digit number is allowed");
                }

                char[] guessArray = guessValue.ToCharArray();

                if (guessArray.Length > 4)
                {
                    return (0, 0, "A maximum of 4 digit number is allowed");
                }

                if (guessArray.Length != guessArray.Distinct().Count())
                {
                    return (0, 0, "The 4 digit numbers must be unique");
                }

                if (Array.Exists(guessArray, c => c == _zero))
                {
                    return (0, 0, "Zero(0) not allowed, please insert another set of 4 digit number");
                }

                char[] secreatArray = _valueToGuess.ToCharArray();
                int commonality = guessArray.Intersect(secreatArray).Count();

                int bulls = 0;
                for (int i = 0; i < guessArray.Length; i++)
                {
                    if (secreatArray[i] == guessArray[i])
                    {
                        bulls++;
                    }
                }

                return (bulls, (commonality - bulls), null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return (0, 0, "System Error, please restart application");
            }

        }

        #endregion
    }
}
