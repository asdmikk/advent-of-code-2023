const rawContent = await Deno.readTextFile('./input_1.txt')

const cardRankings = [
  'J',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'T',
  'Q',
  'K',
  'A',
]

function countCards(hand: string) {
  const cardCounts: { [key: string]: number } = {}
  hand.split('').forEach((card) => {
    cardCounts[card] = (cardCounts[card] || 0) + 1
  })
  return cardCounts
}

const handStrengths = [
  // High card
  (hand: string) => new Set([...hand]).size === hand.length,
  // One pair
  (hand: string) => new Set([...hand]).size === hand.length - 1,
  // Two pair
  (hand: string) => {
    const cardCounts = countCards(hand)
    return Object.values(cardCounts).filter((count) => count === 2).length === 2
  },
  // Three of a kind
  (hand: string) => {
    const cardCounts = countCards(hand)
    const counts = Object.values(cardCounts)
    return (
      counts.filter((count) => count === 3).length === 1 &&
      counts.filter((count) => count === 2).length === 0
    )
  },
  // Full house
  (hand: string) => {
    const cardCounts = countCards(hand)
    const counts = Object.values(cardCounts)
    return (
      counts.filter((count) => count === 3).length === 1 &&
      counts.filter((count) => count === 2).length === 1
    )
  },
  // Four of a kind
  (hand: string) => {
    const cardCounts = countCards(hand)
    return Object.values(cardCounts).filter((count) => count === 4).length === 1
  },
  // Five of a kind
  (hand: string) => new Set([...hand]).size === 1,
]

// console.log(rawContent)

function mostOrStrongestCard(
  cards: string[],
  cardCounts: { [key: string]: number }
) {
  const [strongerCard] = cards.toSorted((card1, card2) => {
    const count1 = cardCounts[card1]
    const count2 = cardCounts[card2]

    if (count1 === count2) {
      const rank1 = cardRankings.indexOf(card1)
      const rank2 = cardRankings.indexOf(card2)

      if (rank1 > rank2) {
        return -1
      }
      if (rank1 < rank2) {
        return 1
      }
      return 0
    }

    if (count1 > count2) {
      return -1
    }
    if (count1 < count2) {
      return 1
    }
    return 0
  })

  return strongerCard
}

function strongestHandWithJoker(hand: string) {
  const cardCounts = countCards(hand)
  const differentCardsCount = Object.values(cardCounts).length

  let strongestCard = 'A'

  if (differentCardsCount === 2) {
    // Five of a kind
    const otherCard = Object.keys(cardCounts).find((card) => card !== 'J')
    strongestCard = otherCard!
  }

  if (differentCardsCount === 3) {
    // Four of a kind
    const otherCards = Object.keys(cardCounts).filter((card) => card !== 'J')
    const strongerCard = mostOrStrongestCard(otherCards, cardCounts)
    strongestCard = strongerCard
  }

  if (differentCardsCount === 4) {
    // Three of a kind
    const otherCards = Object.keys(cardCounts).filter((card) => card !== 'J')
    const strongerCard = mostOrStrongestCard(otherCards, cardCounts)
    strongestCard = strongerCard
  }

  if (differentCardsCount === 5) {
    // One pair
    const otherCards = Object.keys(cardCounts).filter((card) => card !== 'J')
    const [strongerCard] = otherCards.toSorted((card1, card2) => {
      return cardRankings.indexOf(card2) - cardRankings.indexOf(card1)
    })
    strongestCard = strongerCard
  }

  return hand.replaceAll('J', strongestCard)
}

function handStrength(hand: string) {
  const newHand = hand.includes('J') ? strongestHandWithJoker(hand) : hand
  return handStrengths.findIndex((handStrength) => handStrength(newHand))
}

function compareEqualStrengthHands(hand1: string, hand2: string) {
  for (let i = 0; i < hand1.length; i++) {
    const cardRanking1 = cardRankings.indexOf(hand1[i])
    const cardRanking2 = cardRankings.indexOf(hand2[i])

    if (cardRanking1 > cardRanking2) {
      return 1
    }
    if (cardRanking1 < cardRanking2) {
      return -1
    }
  }
  return 0
}

const sortedHands = rawContent
  .split('\n')
  .map((line) => {
    const [hand, rawBid] = line.split(' ')
    return {
      hand,
      bid: +rawBid,
    }
  })
  .toSorted(({ hand: hand1 }, { hand: hand2 }) => {
    const handStrength1 = handStrength(hand1)
    const handStrength2 = handStrength(hand2)

    if (handStrength1 > handStrength2) {
      return 1
    }
    if (handStrength1 < handStrength2) {
      return -1
    }
    if (handStrength1 === handStrength2) {
      return compareEqualStrengthHands(hand1, hand2)
    }
    return 0
  })

const totalWinnings = sortedHands.reduce(
  (total, { bid }, index) => total + (index + 1) * bid,
  0
)

console.log(totalWinnings)
