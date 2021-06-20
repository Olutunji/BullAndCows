namespace Games.Entities
{
    public class GuessResult
    {
        public string Guess { get; set; }
        public int Bulls { get; set; }
        public int Cows { get; set; }
        public string Message { get; set; }
        public bool Strike => Bulls == 4;
    }
}
