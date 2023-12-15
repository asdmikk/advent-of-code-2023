// const rawContent = Deno.readTextFileSync('./input_1_test.txt')
const rawContent = Deno.readTextFileSync('./input_1.txt')

const SQUARE = '#'
const ROUND = 'O'
const OPEN = '.'

type Space = typeof SQUARE | typeof ROUND | typeof OPEN

const map = rawContent.split('\n').map((line) => line.split('')) as Space[][]

function printMap(map: Space[][]) {
  map.forEach((line) => console.log(line.map((c) => c.padEnd(2, ' ')).join('')))
}

// printMap(map)
// console.log('-------------')

function moveLooseRocks(map: Space[][]) {
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[0].length; col++) {
      const space = map[row][col]

      if (space === OPEN) {
        let nextRow = row + 1
        if (nextRow >= map.length) {
          // console.log('continue')
          continue
        }
        // console.log(row, col, map[nextRow][col])
        while (nextRow < map.length - 1 && map[nextRow][col] === OPEN) {
          nextRow++
        }
        // console.log('nextRow', nextRow)
        const nextRock = map[nextRow][col]
        if (nextRock === ROUND) {
          map[nextRow][col] = OPEN
          map[row][col] = ROUND
        }
      }
    }
  }
}

function sumLoad(map: Space[][]): number {
  let sum = 0

  map.forEach((line, index) => {
    const looseRocks = line.filter((space) => space === ROUND).length
    sum += looseRocks * (map.length - index)
  })

  return sum
}

moveLooseRocks(map)

// printMap(map)

const result = sumLoad(map)

console.log(result)
