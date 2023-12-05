const rawContent = Deno.readTextFileSync('input_1.txt')

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

const locations = seeds.map((seed) => {
  let input = seed

  maps.forEach((map) => {
    input = getDestinationForSource(input, map)
  })

  return input
})

const minLocation = Math.min(...locations)

console.log(minLocation)
