// const rawContent = Deno.readTextFileSync('./input_1_test_1.txt')
// const rawContent = Deno.readTextFileSync('./input_1_test_2.txt')
const rawContent = Deno.readTextFileSync('./input_1.txt')

// console.log(rawContent)
// console.log('-------------------')

const PULSE = {
  HIGH: 1,
  LOW: 0,
} as const

type Pulse = (typeof PULSE)[keyof typeof PULSE]

type System = Module[]

type Input = {
  module: string
  value: Pulse
}

interface Module {
  type: string
  name: string
  inputModules: string[]
  outputModules: string[]
  input: Input[]
  tick(context: System): Pulse[]
  process(context: System, input: Input): Pulse[]
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

function getFlipFlop(name: string, outputModules: string[]): FlipFlop {
  return {
    type: 'flipflop',
    name,
    state: 'off',
    inputModules: [],
    outputModules,
    input: [],
    tick(context: System) {
      if (this.input.length === 0) {
        return []
      }

      const outputs: Pulse[] = []
      this.input.forEach((input) => {
        const o = this.process(context, input)
        outputs.push(...o)
      })
      this.input = []

      return outputs
    },
    process(context: System, input: Input) {
      const inputValue = input.value

      if (inputValue === undefined) {
        throw new Error('Input value is undefined')
      }

      if (inputValue === PULSE.HIGH) {
        return []
      }
      const output = this.state === 'on' ? PULSE.LOW : PULSE.HIGH

      const outputs: Pulse[] = []

      this.outputModules.forEach((moduleName) => {
        console.log(this.name, output, moduleName)
        context
          .find((module) => module.name === moduleName)!
          .input.push({ module: this.name, value: output })
        outputs.push(output)
      })

      this.state = this.state === 'on' ? 'off' : 'on'

      return outputs
    },
  }
}

function getConjunction(name: string, outputModules: string[]): Conjunction {
  return {
    type: 'conjunction',
    name,
    memory: {},
    inputModules: [],
    outputModules,
    input: [],
    tick(context: System) {
      if (this.input.length === 0) {
        return []
      }
      const outputs: Pulse[] = []
      this.input.forEach((input) => {
        const o = this.process(context, input)
        outputs.push(...o)
      })
      this.input = []

      return outputs
    },
    process(context: System, input: Input) {
      this.memory[input.module] = input.value

      const output = Object.values(this.memory).every(
        (pulse) => pulse === PULSE.HIGH
      )
        ? PULSE.LOW
        : PULSE.HIGH

      const outputs: Pulse[] = []

      this.outputModules.forEach((moduleName) => {
        console.log(this.name, output, moduleName)
        context
          .find((module) => module.name === moduleName)!
          .input.push({ module: this.name, value: output })
        outputs.push(output)
      })

      return outputs
    },
    init() {
      this.memory = Object.fromEntries(
        this.inputModules.map((name) => [name, PULSE.LOW])
      )
    },
  }
}

function getBroadcaster(outputModules: string[]): Broadcaster {
  return {
    type: 'broadcaster',
    name: 'broadcaster',
    inputModules: [],
    outputModules,
    input: [],
    tick(context: System) {
      if (this.input.length === 0) {
        return []
      }

      const outputs: Pulse[] = []
      this.input.forEach((input) => {
        const o = this.process(context, input)
        outputs.push(...o)
      })
      this.input = []

      return outputs
    },
    process(context: System) {
      const pulse = this.input[0]?.value

      if (pulse === undefined) {
        throw new Error('Input value is undefined')
      }

      const outputs: Pulse[] = []

      this.outputModules.forEach((moduleName) => {
        console.log(this.name, pulse, moduleName)
        context
          .find((module) => module.name === moduleName)!
          .input.push({ module: this.name, value: pulse })
        outputs.push(pulse)
      })

      return outputs
    },
  }
}

function getButton(): Button {
  return {
    type: 'button',
    name: 'button',
    inputModules: [],
    outputModules: ['broadcaster'],
    input: [],
    tick(context: System) {
      if (this.input.length === 0) {
        return []
      }

      const outputs: Pulse[] = []
      this.input.forEach((input) => {
        const o = this.process(context, input)
        outputs.push(...o)
      })
      this.input = []

      return outputs
    },
    process(context: System) {
      const pulse = this.input[0]?.value

      if (pulse === undefined) {
        throw new Error('Input value is undefined')
      }

      const outputs: Pulse[] = []

      this.outputModules.forEach((moduleName) => {
        console.log(this.name, pulse, moduleName)
        context
          .find((module) => module.name === moduleName)!
          .input.push({ module: this.name, value: pulse })
        outputs.push(pulse)
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
    inputModules: [],
    outputModules: [],
    input: [],
    tick(context: System) {
      if (this.input.length === 0) {
        return []
      }

      const outputs: Pulse[] = []
      this.input.forEach((input) => {
        const o = this.process(context, input)
        outputs.push(...o)
      })
      this.input = []

      return []
    },
    process(context: System, input: Input) {
      this.values.push(input.value)

      return []
    },
    reset() {
      this.values = []
    },
  }
}

function getSystem(): System {
  const system: System = [
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
      return module
    }),
    getButton(),
  ]

  system.forEach((module) => {
    module.outputModules.forEach((name) => {
      const existingModule = system.find((module) => module.name === name)
      if (!existingModule) {
        system.push(getUntyped(name))
      }
    })
  })

  return system
}

function connectSystem(system: System) {
  system.forEach((module) => {
    module.outputModules.forEach((moduleName) => {
      const existingModule = system.find((module) => module.name === moduleName)
      existingModule!.inputModules.push(module.name)
    })
  })
  system.forEach((module) => {
    module.init?.()
  })
}

const system = getSystem()

connectSystem(system)

Object.values(system).forEach((module) => {
  console.log(
    module.type,
    module.name,
    module.inputModules,
    module.outputModules
  )
})

function tickSystem(system: System): { high: number; low: number } {
  const pulses = { high: 0, low: 0 }

  const modulesWithInputs = system.filter((module) => module.input.length > 0)

  const outputs2: Pulse[] = []

  modulesWithInputs.forEach((module) => {
    const outputs = module.tick(system)
    outputs2.push(...outputs)

    outputs.forEach((pulse) => {
      if (pulse === PULSE.HIGH) {
        pulses.high += 1
      } else {
        pulses.low += 1
      }
    })
  })

  return pulses
}

function pushButton(system: System) {
  system
    .find((module) => module.name === 'button')!
    .input.push({ module: 'finger', value: PULSE.LOW })
}

function runSystemCycle(system: System): { high: number; low: number } {
  const pulses = { high: 0, low: 0 }
  pushButton(system)

  while (system.filter((module) => module.input.length > 0).length > 0) {
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
console.log(pulses.high * pulses.low)

// 547474692 too low
// 567797844 too low
// 703315117
