const rawContent = Deno.readTextFileSync('./input_1.txt')

const cubeAmounts = {
  red: 12,
  green: 13,
  blue: 14,
} as const

type Color = keyof typeof cubeAmounts
type CubeAmount = { color: Color; amount: number }
type Draw = CubeAmount[]
type Game = {
  id: number
  draws: Draw[]
}

const games: Game[] = rawContent.split('\n').map((line) => {
  const [gameName, rawDraws] = line.split(':')
  const gameId = +gameName.split(' ')[1]

  const draws: Draw[] = rawDraws.split(';').map((rawDraw) => {
    const rawCubes = rawDraw.split(',')
    const cubes: CubeAmount[] = rawCubes.map((rawCube) => {
      const [amount, color] = rawCube.split(' ').filter(Boolean)
      return { color: color as Color, amount: +amount }
    })
    return cubes
  })

  return {
    id: gameId,
    draws,
  }
})

const validGames = games.filter((game) => {
  const hasInvalidDraws = game.draws.some((draw) => {
    const hasInvalidCubes = draw.some((cube) => {
      const { color, amount } = cube
      return amount > cubeAmounts[color]
    })
    return hasInvalidCubes
  })
  return !hasInvalidDraws
})

const validGamesIdSums = validGames
  .map((game) => game.id)
  .reduce((acc, curr) => acc + curr, 0)

console.log(validGamesIdSums)
