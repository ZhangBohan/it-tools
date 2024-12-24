export interface TimerRecord {
  id: number;
  time: number;
  date: Date;
  scramble: string;
}

export function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = (time % 60).toFixed(2);
  return minutes > 0 ? `${minutes}:${seconds.padStart(5, '0')}` : seconds;
}

export function generateScramble(): string {
  const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
  const modifiers = ['', '\'', '2'];
  const length = 20;
  let lastMove = '';
  let scramble = [];

  for (let i = 0; i < length; i++) {
    let move;
    do {
      move = moves[Math.floor(Math.random() * moves.length)];
    } while (move === lastMove);
    
    lastMove = move;
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(move + modifier);
  }

  return scramble.join(' ');
} 