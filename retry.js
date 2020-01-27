import Delay from "delay"
import { createMachine, state as final, state} from "robot3"

const MINUTES_10= 1000* 60* 10

async function get( slot, ctx){
	const value= ctx[ slot]
	if( value instanceof Function){
		return value.call( ctx)
	}else{
		return value
	}
}

export function delayer( ctx){
	const
		exponentiator= await get( "exponentiator", ctx),
		exponent= exponentiator( ctx),
		old= await get( "delay", ctx),
		unchecked= exponent* old,
		minTimeout= await get( "minTimeout", ctx)
	if( unchecked< minTimeout){
		return minTimeout
	}
	const maxTimeout= await get( "maxTimeout", ctx)
	if( unchecked> maxTimeout){
		return maxTimeout
	}
	return unchecked
}

export function exponentiator( ctx){
	const
		base= await get( "factor", ctx),
		rand= await get( "random", ctx)
	if( rand< 1|| isNaN( rand)){
		return delay* base
	}
	const rf= Math.random()* (rand- 1)
	return rf+ 1
}
exponentiator.exponentiator= exponentiator
exponentiator.factor= 1.618
exponentiator.random= 1.618

export function Retry( operation, opt){
	const ctx= Object.assign({
		retries: -1,
		count: 0,
		minTimeout: 1000,
		maxTimeout: MINUTES_10,
		delay: 0, // current delay
		timeout: -1,
		delayer,
		...exponentiator
	}, opt)

	const machine= createMachine({
		attempt: invoke( attempt),
			transition( "done", "done"),
			transition( "error", "delay")
		),
		delay: state(
			transition( "retry", "attempt")
		),
		done: final(),
		error: final()
	}, ctx)
}
export default retry
