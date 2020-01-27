import { createMachine, state} from "robot3"

export const definition= {
	attempt: state(
		transition( "done", "done"),
		transition( "error", "delay")
	),
	delay: state(
		transition( "retry", "attempt")
	),
	done: state(),
	error: state()
}

export const machine= createMachine( definition)
export default machine
