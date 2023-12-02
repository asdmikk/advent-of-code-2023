const rawContent = Deno.readTextFileSync('./input_2.txt')

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

type MinPossibleSet = {
  id: number
  red: number
  green: number
  blue: number
}

const minPossibleSets: MinPossibleSet[] = games.map((game) => {
  const red: number[] = []
  const green: number[] = []
  const blue: number[] = []

  game.draws.forEach((draw) => {
    red.push(draw.find((cube) => cube.color === 'red')?.amount ?? 0)
    green.push(draw.find((cube) => cube.color === 'green')?.amount ?? 0)
    blue.push(draw.find((cube) => cube.color === 'blue')?.amount ?? 0)
  })

  return {
    id: game.id,
    red: Math.max(...red),
    green: Math.max(...green),
    blue: Math.max(...blue),
  }
})

const powers = minPossibleSets.map((set) => set.red * set.green * set.blue)

const sum = powers.reduce((acc, curr) => acc + curr, 0)

console.log(sum)
