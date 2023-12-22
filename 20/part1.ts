// const rawContent = Deno.readTextFileSync('./input_1_test_1.txt')
const rawContent = Deno.readTextFileSync('./input_1_test_2.txt')
// const rawContent = Deno.readTextFileSync('./input_1.txt')

// console.log(rawContent)
// console.log('-------------------')

const PULSE = {
  HIGH: 1,
  LOW: 0,
} as const

type Pulse = (typeof PULSE)[keyof typeof PULSE]

interface Module {
  type: string
  name: string
  inputModuleNames: string[]
  outputModulesNames: string[]
  outputModules: Module[]
  input: Input[]
  tick(): Pulse[]
  process(): Pulse[]
  init?(): void
}

interface FlipFlop extends Module {
  type: 'flipflop'
  state: 'on' | 'off'
}

interface Conjunction extends Module {
  type: 'conjunction'
  memory: { [name: string]: Pulse }
}

interface Broadcaster extends Module {
  type: 'broadcaster'
}

interface Button extends Module {
  type: 'button'
}

interface Untyped extends Module {
  type: 'untyped'
  values: Pulse[]
  reset(): void
}

type System = { [name: string]: Module }

type Input = {
  module: string
  value: Pulse
}

const globalPulses = {
  high: 0,
  low: 0,
}

function getFlipFlop(name: string, outputModulesNames: string[]): FlipFlop {
  return {
    type: 'flipflop',
    name,
    state: 'off',
    inputModuleNames: [],
    outputModulesNames,
    outputModules: [],
    input: [],
    tick() {
      if (this.input.length === 0) {
        return []
      }

      const outputs = this.process()
      this.input = []

      return outputs
    },
    process() {
      const inputValue = this.input[0]?.value

      if (inputValue === undefined) {
        throw new Error('Input value is undefined')
      }

      if (inputValue === PULSE.HIGH) {
        return []
      }
      const output = this.state === 'on' ? PULSE.LOW : PULSE.HIGH

      const outputs: Pulse[] = []

      this.outputModules.forEach((module) => {
        console.log(this.name, output, module.name)
        module.input.push({ module: this.name, value: output })
        outputs.push(output)
        if (output === PULSE.HIGH) {
          globalPulses.high += 1
        } else {
          globalPulses.low += 1
        }
      })

      this.state = this.state === 'on' ? 'off' : 'on'

      return outputs
    },
  }
}

function getConjunction(
  name: string,
  outputModulesNames: string[]
): Conjunction {
  return {
    type: 'conjunction',
    name,
    memory: {},
    inputModuleNames: [],
    outputModulesNames,
    outputModules: [],
    input: [],
    tick() {
      if (this.input.length === 0) {
        return []
      }

      const outputs = this.process()
      this.input = []

      return outputs
    },
    process() {
      this.input.forEach(({ module, value }) => {
        this.memory[module] = value
      })

      const output = Object.values(this.memory).every(
        (pulse) => pulse === PULSE.HIGH
      )
        ? PULSE.LOW
        : PULSE.HIGH

      const outputs: Pulse[] = []

      this.outputModules.forEach((module) => {
        console.log(this.name, output, module.name)
        module.input.push({ module: this.name, value: output })
        outputs.push(output)
        if (output === PULSE.HIGH) {
          globalPulses.high += 1
        } else {
          globalPulses.low += 1
        }
      })

      return outputs
    },
    init() {
      this.memory = Object.fromEntries(
        this.inputModuleNames.map((name) => [name, PULSE.LOW])
      )
    },
  }
}

function getBroadcaster(outputModulesNames: string[]): Broadcaster {
  return {
    type: 'broadcaster',
    name: 'broadcaster',
    inputModuleNames: [],
    outputModulesNames,
    outputModules: [],
    input: [],
    tick() {
      if (this.input.length === 0) {
        return []
      }

      const outputs = this.process()
      this.input = []

      return outputs
    },
    process() {
      const pulse = this.input[0]?.value

      if (pulse === undefined) {
        throw new Error('Input value is undefined')
      }

      const outputs: Pulse[] = []

      this.outputModules.forEach((module) => {
        console.log(this.name, pulse, module.name)
        module.input.push({ module: this.name, value: pulse })
        outputs.push(pulse)
        if (pulse === PULSE.HIGH) {
          globalPulses.high += 1
        } else {
          globalPulses.low += 1
        }
      })

      return outputs
    },
  }
}

function getButton(): Button {
  return {
    type: 'button',
    name: 'button',
    inputModuleNames: [],
    outputModulesNames: ['broadcaster'],
    outputModules: [],
    input: [],
    tick() {
      if (this.input.length === 0) {
        return []
      }

      const outputs = this.process()
      this.input = []

      return outputs
    },
    process() {
      const pulse = this.input[0]?.value

      if (pulse === undefined) {
        throw new Error('Input value is undefined')
      }

      const outputs: Pulse[] = []

      this.outputModules.forEach((module) => {
        console.log(this.name, pulse, module.name)
        module.input.push({ module: this.name, value: pulse })
        outputs.push(pulse)
        if (pulse === PULSE.HIGH) {
          globalPulses.high += 1
        } else {
          globalPulses.low += 1
        }
      })

      return outputs
    },
  }
}

function getUntyped(name: string): Untyped {
  return {
    type: 'untyped',
    name,
    values: [],
    inputModuleNames: [],
    outputModulesNames: [],
    outputModules: [],
    input: [],
    tick() {
      if (this.input.length === 0) {
        return []
      }

      this.process()
      this.input = []

      return []
    },
    process() {
      this.values.push(...this.input.map(({ value }) => value))
      // console.log('Output:', pulse)

      return []
    },
    reset() {
      this.values = []
    },
  }
}

function getSystem(): System {
  const system: System = Object.fromEntries([
    ...rawContent.split('\n').map((line) => {
      const [rawModule, rawDestinations] = line.split(' -> ')
      const outputModulesNames = rawDestinations.split(', ')
      let module: Module
      if (rawModule === 'broadcaster') {
        module = getBroadcaster(outputModulesNames)
      } else if (rawModule.startsWith('%')) {
        const name = rawModule.slice(1)
        module = getFlipFlop(name, outputModulesNames)
      } else if (rawModule.startsWith('&')) {
        const name = rawModule.slice(1)
        module = getConjunction(name, outputModulesNames)
      } else {
        throw new Error('Unknown module type')
      }
      return [module.name ?? module.type, module]
    }),
    ['button', getButton()],
  ])

  const untyped: string[] = []

  Object.values(system).forEach((module) => {
    module.outputModulesNames.forEach((name) => {
      if (!system[name]) {
        untyped.push(name)
      }
    })
  })

  console.log(untyped)

  untyped.forEach((name) => {
    system[name] = getUntyped(name)
  })

  return system
}

function connectSystem(system: System) {
  Object.values(system).forEach((module) => {
    module.outputModules = module.outputModulesNames.map((name) => system[name])
  })
  Object.values(system).forEach((module) => {
    module.outputModules.forEach((destination) => {
      destination.inputModuleNames.push(module.name)
    })
  })
  Object.values(system).forEach((module) => {
    module.init?.()
  })
}

const system = getSystem()

connectSystem(system)

Object.values(system).forEach((module) => {
  console.log(
    module.type,
    module.name,
    module.inputModuleNames,
    module.outputModulesNames
  )
})

function tickSystem(system: System): { high: number; low: number } {
  const pulses = { high: 0, low: 0 }

  const modulesWithInputs = Object.values(system).filter(
    (module) => module.input.length > 0
  )

  const outputs2: Pulse[] = []

  Object.values(system).forEach((module) => {
    const outputs = module.tick()
    outputs2.push(...outputs)
    // outputs.forEach((pulse) => {
    //   if (pulse === PULSE.HIGH) {
    //     pulses.high += 1
    //   } else {
    //     pulses.low += 1
    //   }
    // })
  })

  outputs2.forEach((pulse) => {
    if (pulse === PULSE.HIGH) {
      pulses.high += 1
    } else {
      pulses.low += 1
    }
  })

  // Object.values(system)
  //   .filter((module) => module.input.length > 0)
  //   .forEach((module) => {
  //     module.input.forEach(({ module: name, value }) => {
  //       if (value === PULSE.HIGH) {
  //         pulses.high += 1
  //       } else {
  //         pulses.low += 1
  //       }
  //     })
  //   })

  return pulses
}

function pushButton(system: System) {
  system.button.input.push({ module: 'finger', value: PULSE.LOW })
}

function runSystemCycle(system: System): { high: number; low: number } {
  const pulses = { high: 0, low: 0 }
  pushButton(system)

  while (
    Object.values(system).filter((module) => module.input.length > 0).length > 0
  ) {
    const tickPulses = tickSystem(system)

    pulses.high += tickPulses.high
    pulses.low += tickPulses.low
  }

  return pulses
}

const pulses = { high: 0, low: 0 }

for (let i = 0; i < 1000; i++) {
  console.log('--------------------')
  const cyclePulses = runSystemCycle(system)
  pulses.high += cyclePulses.high
  pulses.low += cyclePulses.low
}

console.log('--------------------')
console.log(pulses)
console.log('--------------------')
console.log(globalPulses)

console.log('--------------------')
console.log(pulses.high * pulses.low)

// 547474692 too low
// 567797844 too low
// 567797844
// 603670844
// 568063960
// 703315117 correct
