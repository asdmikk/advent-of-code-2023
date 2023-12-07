const rawContent = await Deno.readTextFile('./input_1.txt')

const cardRankings = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'T',
  'J',
  'Q',
  'K',
  'A',
]

function countCards(cards: string[]) {
  const cardCounts: { [key: string]: number } = {}
  cards.forEach((card) => {
    cardCounts[card] = (cardCounts[card] || 0) + 1
  })
  return cardCounts
}

const handStrengths = [
  // High card
  (cards: string[]) => new Set([...cards]).size === cards.length,
  // One pair
  (cards: string[]) => new Set([...cards]).size === cards.length - 1,
  // Two pair
  (cards: string[]) => {
    const cardCounts = countCards(cards)
    return Object.values(cardCounts).filter((count) => count === 2).length === 2
  },
  // Three of a kind
  (cards: string[]) => {
    const cardCounts = countCards(cards)
    const counts = Object.values(cardCounts)
    return (
      counts.filter((count) => count === 3).length === 1 &&
      counts.filter((count) => count === 2).length === 0
    )
  },
  // Full house
  (cards: string[]) => {
    const cardCounts = countCards(cards)
    const counts = Object.values(cardCounts)
    return (
      counts.filter((count) => count === 3).length === 1 &&
      counts.filter((count) => count === 2).length === 1
    )
  },
  // Four of a kind
  (cards: string[]) => {
    const cardCounts = countCards(cards)
    return Object.values(cardCounts).filter((count) => count === 4).length === 1
  },
  // Five of a kind
  (cards: string[]) => new Set([...cards]).size === 1,
]

// console.log(rawContent)

const sortedCards = rawContent
  .split('\n')
  .map((line) => {
    const [cards, rawBid] = line.split(' ')
    return {
      cards,
      bid: +rawBid,
    }
  })
  .toSorted(({ cards: cards1 }, { cards: cards2 }) => {
    const handStrength1 = handStrengths.findIndex((handStrength) =>
      handStrength(cards1.split(''))
    )
    const handStrength2 = handStrengths.findIndex((handStrength) =>
      handStrength(cards2.split(''))
    )

    if (handStrength1 > handStrength2) {
      return 1
    }
    if (handStrength1 < handStrength2) {
      return -1
    }
    if (handStrength1 === handStrength2) {
      for (let i = 0; i < cards1.length; i++) {
        const cardRanking1 = cardRankings.indexOf(cards1[i])
        const cardRanking2 = cardRankings.indexOf(cards2[i])

        if (cardRanking1 > cardRanking2) {
          return 1
        }
        if (cardRanking1 < cardRanking2) {
          return -1
        }
      }
    }
    return 0
  })

const totalWinnings = sortedCards.reduce(
  (total, { bid }, index) => total + (index + 1) * bid,
  0
)

console.log(totalWinnings)
