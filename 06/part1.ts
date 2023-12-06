const rawContent = await Deno.readTextFile('./input_1.txt')

// console.log(rawContent)

const [times, distances] = rawContent.split('\n').map((line) => {
  const [_, ...values] = line.split(' ').filter(Boolean).map(Number)
  return values
})

const races = times.map((time, index) => ({
  time,
  distance: distances[index],
}))

function speedToDistance(speed: number, time: number) {
  return speed * time
}

const winningWaitTimes = races.map(({ time, distance }) => {
  const times: number[] = []

  for (let i = 0; i < time; i++) {
    const waitTime = i
    const speed = i

    const distanceCovered = speedToDistance(speed, time - waitTime)

    if (distanceCovered > distance) {
      times.push(waitTime)
    }
  }

  return times
})

const result = winningWaitTimes.reduce((curr, times) => curr * times.length, 1)

console.log(result)
