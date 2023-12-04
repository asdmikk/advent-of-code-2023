const rawContent = Deno.readTextFileSync('input_2.txt')

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

const cardCounts: number[] = Array.from({ length: cards.length }, () => 1)

gameResults.forEach((gameResult, index) => {
  for (let i = 0; i < cardCounts[index]; i++) {
    const start = index + 1
    const end = Math.min(
      index + 1 + gameResult.matches.length,
      cardCounts.length
    )
    for (let j = start; j < end; j++) {
      cardCounts[j]++
    }
  }
})

const totalCards = cardCounts.reduce((acc, count) => acc + count, 0)

console.log(totalCards)
