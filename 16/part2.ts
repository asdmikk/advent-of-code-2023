// const rawContent = Deno.readTextFileSync('./input_1_test.txt')
const rawContent = Deno.readTextFileSync('./input_1.txt')

function printMap(map: string[][]) {
  map.forEach((line) => console.log(line.map((c) => c.padEnd(2, ' ')).join('')))
}

type Space = '.' | '/' | '\\' | '|' | '-'

const map = rawContent.split('\n').map((line) => line.split('')) as Space[][]

// printMap(map)

type Position = {
  x: number
  y: number
}

type Direction = 'N' | 'E' | 'S' | 'W'

type Beam = {
  position: Position
  direction: Direction
}

function nextStep(map: Space[][], beam: Beam): Beam[] {
  const { position, direction } = beam

  const space = map[position.y][position.x]
  // console.log('space', space)

  const newBeams: Beam[] = []

  if (space === '.') {
    const beam = {
      position: { ...position },
      direction,
    }
    if (direction === 'N') {
      beam.position.y -= 1
    } else if (direction === 'E') {
      beam.position.x += 1
    } else if (direction === 'S') {
      beam.position.y += 1
    } else if (direction === 'W') {
      beam.position.x -= 1
    }
    newBeams.push(beam)
  } else if (space === '/') {
    const beam = {
      position: { ...position },
      direction,
    }
    if (direction === 'N') {
      beam.position.x += 1
      beam.direction = 'E'
    } else if (direction === 'E') {
      beam.position.y -= 1
      beam.direction = 'N'
    } else if (direction === 'S') {
      beam.position.x -= 1
      beam.direction = 'W'
    } else if (direction === 'W') {
      beam.position.y += 1
      beam.direction = 'S'
    }
    newBeams.push(beam)
  } else if (space === '\\') {
    const beam = {
      position: { ...position },
      direction,
    }
    if (direction === 'N') {
      beam.position.x -= 1
      beam.direction = 'W'
    } else if (direction === 'E') {
      beam.position.y += 1
      beam.direction = 'S'
    } else if (direction === 'S') {
      beam.position.x += 1
      beam.direction = 'E'
    } else if (direction === 'W') {
      beam.position.y -= 1
      beam.direction = 'N'
    }
    newBeams.push(beam)
  } else if (space === '|') {
    const beams = [
      {
        position: { ...position },
        direction,
      },
    ]

    if (direction === 'N') {
      beams[0].position.y -= 1
    } else if (direction === 'E') {
      beams[0].position.y -= 1
      beams[0].direction = 'N'
      const splitBeam: Beam = {
        position: { ...position },
        direction,
      }
      splitBeam.position.y += 1
      splitBeam.direction = 'S'
      beams.push(splitBeam)
    } else if (direction === 'S') {
      beams[0].position.y += 1
    } else if (direction === 'W') {
      beams[0].position.y += 1
      beams[0].direction = 'S'
      const splitBeam: Beam = {
        position: { ...position },
        direction,
      }
      splitBeam.position.y -= 1
      splitBeam.direction = 'N'
      beams.push(splitBeam)
    }

    newBeams.push(...beams)
  } else if (space === '-') {
    const beams = [
      {
        position: { ...position },
        direction,
      },
    ]

    if (direction === 'N') {
      beams[0].position.x -= 1
      beams[0].direction = 'W'
      const splitBeam: Beam = {
        position: { ...position },
        direction,
      }
      splitBeam.position.x += 1
      splitBeam.direction = 'E'
      beams.push(splitBeam)
    } else if (direction === 'E') {
      beams[0].position.x += 1
    } else if (direction === 'S') {
      beams[0].position.x += 1
      beams[0].direction = 'E'
      const splitBeam: Beam = {
        position: { ...position },
        direction,
      }
      splitBeam.position.x -= 1
      splitBeam.direction = 'W'
      beams.push(splitBeam)
    } else if (direction === 'W') {
      beams[0].position.x -= 1
    }

    newBeams.push(...beams)
  }

  return newBeams.filter((beam) => {
    if (beam.position.x < 0 || beam.position.y < 0) {
      return false
    }
    if (beam.position.x >= map[0].length || beam.position.y >= map.length) {
      return false
    }
    return true
  })
}

type BeamKey = `${number}_${number}_${Direction}`

function getBeamKey(beam: Beam): BeamKey {
  return `${beam.position.x}_${beam.position.y}_${beam.direction}`
}

function runBeam(startBeam: Beam): number {
  let beams: Beam[] = [startBeam]
  const visited: Set<BeamKey> = new Set([getBeamKey(startBeam)])

  while (beams.length > 0) {
    const newBeams: Beam[] = []
    beams.forEach((beam) => {
      const nextBeams = nextStep(map, beam)

      nextBeams.forEach((nextBeam) => {
        const key = getBeamKey(nextBeam)

        if (!visited.has(key)) {
          visited.add(key)
          newBeams.push(nextBeam)
        }
      })
    })

    beams = newBeams
  }

  const uniquePositions = new Set(
    [...visited].map((key) => {
      const [x, y] = key.split('_')
      return `${x}_${y}`
    })
  )

  return uniquePositions.size
}

let max = 0

// W edge
for (let y = 0; y < map.length; y++) {
  const startBeam: Beam = {
    position: {
      x: 0,
      y,
    },
    direction: 'E',
  }
  const count = runBeam(startBeam)
  if (count > max) {
    max = count
  }
}

// E edge
for (let y = 0; y < map.length; y++) {
  const startBeam: Beam = {
    position: {
      x: map[0].length - 1,
      y,
    },
    direction: 'W',
  }
  const count = runBeam(startBeam)
  if (count > max) {
    max = count
  }
}

// N edge
for (let x = 0; x < map[0].length; x++) {
  const startBeam: Beam = {
    position: {
      x,
      y: 0,
    },
    direction: 'S',
  }
  const count = runBeam(startBeam)
  if (count > max) {
    max = count
  }
}

// S edge
for (let x = 0; x < map[0].length; x++) {
  const startBeam: Beam = {
    position: {
      x,
      y: map.length - 1,
    },
    direction: 'N',
  }
  const count = runBeam(startBeam)
  if (count > max) {
    max = count
  }
}

console.log(max)
