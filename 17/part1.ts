// Steal this heap implementation
import { Heap } from 'npm:heap-js'

const rawContent = Deno.readTextFileSync('./input_1_test.txt')
// const rawContent = Deno.readTextFileSync('./input_1.txt')

type Graph = number[][]

type Position = {
  x: number
  y: number
}

type Distance = number

type Direction = 'N' | 'S' | 'E' | 'W'

type Node = {
  position: Position
  weight: number
  distance: Distance
  path: Position[] // for printing out the final path
  heuristic: number // for sorting the heap
  direction: Direction
  stepsInDirection: number
}

type NodeKey = `${number}_${number}_${number}_${Direction}`

function getNodeKey(node: Node): NodeKey {
  const {
    position: { x, y },
    stepsInDirection,
    direction,
  } = node

  return `${x}_${y}_${stepsInDirection}_${direction}`
}

const graph: Graph = rawContent
  .split('\n')
  .map((line) => line.split('').map(Number))

function printMap(map: unknown[][]) {
  map.forEach((line) =>
    console.log(line.map((c) => String(c).padEnd(2, ' ')).join(''))
  )
}

// printMap(graph)
// console.log('-------------------------')

function getNeighbors(
  map: Graph,
  node: Node
): { position: Position; direction: Direction }[] {
  const next = {
    N: [
      {
        position: { x: node.position.x - 1, y: node.position.y },
        direction: 'W',
      },
      {
        position: { x: node.position.x + 1, y: node.position.y },
        direction: 'E',
      },
      {
        position: { x: node.position.x, y: node.position.y - 1 },
        direction: 'N',
      },
    ],
    E: [
      {
        position: { x: node.position.x + 1, y: node.position.y },
        direction: 'E',
      },
      {
        position: { x: node.position.x, y: node.position.y + 1 },
        direction: 'S',
      },
      {
        position: { x: node.position.x, y: node.position.y - 1 },
        direction: 'N',
      },
    ],
    S: [
      {
        position: { x: node.position.x - 1, y: node.position.y },
        direction: 'W',
      },
      {
        position: { x: node.position.x + 1, y: node.position.y },
        direction: 'E',
      },
      {
        position: { x: node.position.x, y: node.position.y + 1 },
        direction: 'S',
      },
    ],
    W: [
      {
        position: { x: node.position.x - 1, y: node.position.y },
        direction: 'W',
      },
      {
        position: { x: node.position.x, y: node.position.y + 1 },
        direction: 'S',
      },
      {
        position: { x: node.position.x, y: node.position.y - 1 },
        direction: 'N',
      },
    ],
  }[node.direction] as { position: Position; direction: Direction }[]

  return (
    next
      // filter out of bounds
      .filter(
        ({ position }) =>
          position.x >= 0 &&
          position.y >= 0 &&
          position.y < map.length &&
          position.x < map[position.y].length
      )
      // filter greater than 3 steps
      .filter(({ direction }) =>
        direction === node.direction ? node.stepsInDirection < 3 : true
      )
  )
}

function getDistance(map: Graph, start: Position, end: Position) {
  const visited: Map<NodeKey, Node> = new Map()
  const toVisit: Heap<Node> = new Heap<Node>(
    (a, b) => a.heuristic - b.heuristic
  )

  const startNode = {
    position: start,
    weight: map[start.y][start.x],
    distance: 0,
    path: [start],
    heuristic: 0,
    stepsInDirection: 0,
  }

  // Each node has a separate state for each direction
  toVisit.init([
    { ...startNode, direction: 'E' },
    { ...startNode, direction: 'S' },
  ])

  while (toVisit.size() > 0) {
    const currentNode = toVisit.pop()!

    if (currentNode.position.x === end.x && currentNode.position.y === end.y) {
      return currentNode
    }

    const neighbors = getNeighbors(map, currentNode)

    neighbors.forEach(({ position, direction }) => {
      const nextWeight = map[position.y][position.x]
      const nextDistance = currentNode.distance + nextWeight
      const straightLineDistance =
        Math.abs(position.x - end.x) + Math.abs(position.y - end.y)

      const nextNode: Node = {
        position,
        weight: nextWeight,
        distance: nextDistance,
        path: [...currentNode.path, position],
        heuristic:
          // dunno this just works
          straightLineDistance + nextDistance,

        direction,
        stepsInDirection:
          currentNode.direction === direction
            ? currentNode.stepsInDirection + 1
            : 1,
      }

      const nodeKey = getNodeKey(nextNode)

      if (!visited.has(nodeKey)) {
        visited.set(nodeKey, nextNode)
        toVisit.push(nextNode)
      }
    })
  }

  return null
}

const start = { x: 0, y: 0 }
const end = { x: graph[0].length - 1, y: graph.length - 1 }

const endNode = getDistance(graph, start, end)

// const illustrativeGraph = [...graph].map((line) => [...line]) as (
//   | string
//   | number
// )[][]
// endNode?.path.forEach((position) => {
//   illustrativeGraph[position.y][position.x] = 'X'
// })

// printMap(illustrativeGraph)

// console.log(endNode)

console.log(endNode?.distance)
