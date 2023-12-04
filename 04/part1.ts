const rawContent = Deno.readTextFileSync('input_1.txt')

// console.log(rawContent)

type Card = {
  cardId: number
  winningNumbers: number[]
  myNumbers: number[]
}

const cards: Card[] = rawContent.split('\n').map((card) => {
  const [cardName, numbers] = card.split(':')
  const cardId = +cardName.split(' ')[1]

  const [rawWinningNumbers, rawMyNumbers] = numbers.split('|')

  const winningNumbers = rawWinningNumbers
    .split(' ')
    .filter(Boolean)
    .map((number) => +number)
  const myNumbers = rawMyNumbers
    .split(' ')
    .filter(Boolean)
    .map((number) => +number)

  return {
    cardId,
    winningNumbers,
    myNumbers,
  }
})

type GameResult = {
  cardId: number
  matches: number[]
}

const gameResults: GameResult[] = cards.map((card) => {
  const matches = card.myNumbers.filter((number) =>
    card.winningNumbers.includes(number)
  )

  return {
    cardId: card.cardId,
    matches,
  }
})

const totalPoints = gameResults.reduce((acc, gameResult) => {
  const matches = gameResult.matches.length
  const points = matches > 0 ? 2 ** (matches - 1) : 0
  return acc + points
}, 0)

console.log(totalPoints)
