using Games.Controllers;
using Games.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;

namespace Games.Tests
{
    [TestClass]
    public class BullsAndCowsControllerTests
    {
        
        private Mock<ApplicationSettings> _settingsMock;
        private Mock<ILogger<BullsAndCowsController>> _logMock;
        private string _valueToGuess = "1234";

        private BullsAndCowsController _controller;

        [TestInitialize]
        public void Initialize()
        {
            _settingsMock = new Mock<ApplicationSettings>();
            _logMock = new Mock<ILogger<BullsAndCowsController>>();

            _controller = new BullsAndCowsController(_settingsMock.Object, _logMock.Object, _valueToGuess);
        }

        #region ValidateGuess

        //[TestMethod]
        public void TestValidateGuessCanHandleExceptions()
        {
            // Arrange

            // Act
            GuessResult result = _controller.ValidateGuess("9876");

            //Assert
            Assert.AreEqual(result.Bulls, 0);
            Assert.AreEqual(result.Cows, 0);
            Assert.AreEqual(result.Message, "System Error, please restart application");
        }

        [TestMethod]
        public void TestValidateGuess()
        {
            // Arrange

            // Act
            GuessResult result = _controller.ValidateGuess("1428");

            //Assert
            Assert.AreEqual(result.Bulls, 1);
            Assert.AreEqual(result.Cows, 2);
            Assert.IsNull(result.Message);
        }

        [TestMethod]
        public void TestValidateGuessWithZeroInGuess()
        {
            // Arrange

            // Act
            GuessResult result = _controller.ValidateGuess("1230");

            //Assert
            Assert.AreEqual(result.Bulls, 0);
            Assert.AreEqual(result.Cows, 0);
            Assert.AreEqual(result.Message, "Zero(0) not allowed, please insert another set of 4 digit number");
        }

        [TestMethod]
        public void TestValidateGuessWithNonDistinctGuess()
        {
            // Arrange

            // Act
            GuessResult result = _controller.ValidateGuess("1231");

            //Assert
            Assert.AreEqual(result.Bulls, 0);
            Assert.AreEqual(result.Cows, 0);
            Assert.AreEqual(result.Message, "The 4 digit numbers must be unique");
        }

        [TestMethod]
        public void TestValidateGuessWithInvalidGuessLength()
        {
            // Arrange

            // Act
            GuessResult result = _controller.ValidateGuess("12345");

            //Assert
            Assert.AreEqual(result.Bulls, 0);
            Assert.AreEqual(result.Cows, 0);
            Assert.AreEqual(result.Message, "A maximum of 4 digit number is allowed");
        }


        [TestMethod]
        public void TestValidateGuessWithInvalidGuessType()
        {
            // Arrange

            // Act
            GuessResult result = _controller.ValidateGuess("SOME");

            //Assert
            Assert.AreEqual(result.Bulls, 0);
            Assert.AreEqual(result.Cows, 0);
            Assert.AreEqual(result.Message, "Only numeric digit number is allowed");
        }

        [TestMethod]
        public void TestValidateGuessWithCorrectGuess()
        {
            // Arrange

            // Act
            GuessResult result = _controller.ValidateGuess("1234");

            //Assert
            Assert.AreEqual(result.Bulls, 4);
            Assert.AreEqual(result.Cows, 0);
            Assert.IsNull(result.Message);
        }

        [TestMethod]
        public void TestValidateGuessWithEmptyValue()
        {
            // Arrange

            // Act
            GuessResult result = _controller.ValidateGuess("");

            //Assert
            Assert.AreEqual(result.Bulls, 0);
            Assert.AreEqual(result.Cows, 0);
            Assert.AreEqual(result.Message, "Please, specify a 4 digit number. Zero(0) not allowed");
        }

        #endregion

        #region RestartGame

        //[TestMethod]
        public void TestRestartGameWithExceptions()
        {
            // Arrange
            ApplicationSettings applicationSettings = new ApplicationSettings
            {
                GuessCharCount = 4
            };
            _controller = new BullsAndCowsController(applicationSettings, _logMock.Object, _valueToGuess);

            // Act
            bool result = _controller.RestartGame();

            //Assert
            Assert.IsFalse(result);
            Assert.AreEqual(_valueToGuess, "1234");
        }

        [TestMethod]
        public void TestRestartGame()
        {
            // Arrange
            ApplicationSettings applicationSettings = new ApplicationSettings
            {
                GuessCharCount = 4
            };
            _controller = new BullsAndCowsController(applicationSettings, _logMock.Object, _valueToGuess);

            // Act
            bool result = _controller.RestartGame();

            //Assert
            Assert.IsTrue(result);
            //Assert.AreNotEqual(_valueToGuess, "1234");
        }

        #endregion
    }
}
