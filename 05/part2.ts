const rawContent = Deno.readTextFileSync('input_1_test.txt')
// const rawContent = Deno.readTextFileSync('input_1.txt')

type SourceToDestinationMap = {
  sourceName: string
  destinationName: string
  sections: {
    source: number
    destination: number
    range: number
  }[]
}

let seeds: number[] = []
const maps: SourceToDestinationMap[] = []

rawContent.split('\n\n').forEach((section, sectionIndex) => {
  if (sectionIndex === 0) {
    const [_, ...rawSeeds] = section.split(' ')
    seeds = rawSeeds.map((seed) => parseInt(seed))
    return
  }

  let currentMap: SourceToDestinationMap = {
    sourceName: '',
    destinationName: '',
    sections: [],
  }

  section.split('\n').forEach((line, index) => {
    if (index === 0) {
      const [rawMapName] = line.split(' ')
      const mapNameComponents = rawMapName.split('-')

      currentMap = {
        sourceName: '',
        destinationName: '',
        sections: [],
      }

      currentMap.sourceName = mapNameComponents[0]
      currentMap.destinationName = mapNameComponents[2]

      return
    }

    const [destination, source, range] = line.split(' ')

    currentMap.sections.push({
      source: +source,
      destination: +destination,
      range: +range,
    })
  })

  maps.push(currentMap)
})

function getDestinationForSource(
  sourceValue: number,
  map: SourceToDestinationMap
) {
  const section = map.sections.find((sect) => {
    return sect.source <= sourceValue && sect.source + sect.range > sourceValue
  })

  if (!section) {
    return sourceValue
  }

  const offset = sourceValue - section!.source

  return section!.destination + offset
}

function groupSeeds(initialSeeds: number[], chunkSize: number) {
  const groupedSeeds = [...initialSeeds]
  const chunks: number[][] = []

  while (groupedSeeds.length > 0) {
    chunks.push(groupedSeeds.splice(0, chunkSize))
  }

  return chunks
}

const seedGroups = groupSeeds(seeds, 2)

let minLocation: number | null = null

// This potato runs approx. 3:30min on my machine with the input_1.txt
seedGroups.forEach(([start, range]) => {
  for (let i = start; i < start + range; i++) {
    let input = i

    maps.forEach((map) => {
      input = getDestinationForSource(input, map)
    })

    if (minLocation === null || input < minLocation) {
      minLocation = input
    }
  }
})

console.log(minLocation)
