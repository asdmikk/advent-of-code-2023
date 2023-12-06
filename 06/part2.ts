const rawContent = await Deno.readTextFile('./input_1.txt')

// console.log(rawContent)

const [time, distance] = rawContent.split('\n').map((line) => {
  const [_, ...values] = line.split(' ').filter(Boolean)
  return +values.join('')
})

function speedToDistance(speed: number, time: number) {
  return speed * time
}

const times: number[] = []

for (let i = 0; i < time; i++) {
  const waitTime = i
  const speed = i

  const distanceCovered = speedToDistance(speed, time - waitTime)

  if (distanceCovered > distance) {
    times.push(waitTime)
  }
}

console.log(times.length)
