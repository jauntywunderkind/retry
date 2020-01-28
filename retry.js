import Delay from "delay"
import { createMachine, state as final, invoke, state, transition} from "robot3"

const MINUTES_10= 1000* 60* 10

export function delayer( ctx){
	ctx.delay= _delayer( ctx)
	return Delay( ctx.delay)
}

export function attempter( ctx){
	++ctx.count
	return Promise.resolve( ctx.operation())
}

export function _delayer( ctx){
	if( ctx.retries>= 0&& ctx.count>= ctx.retries){
		throw new Error("No retries left")
	}
	const
		mult= ctx.exponentiator( ctx),
		delay= mult* (ctx.delay|| 0)
	if( ctx.minTimeout>= 0&& delay< ctx.minTimeout){
		return minTimeout
	}
	if( ctx.maxTimeout>= 0&& delay> ctx.maxTimeout){
		return maxTimeout
	}
	return delay
}

export function exponentiator( ctx){
	if( ctx.expRandom< 1|| isNaN( ctx.expRandom)){
		return ctx.expFactor
	}
	const rf= Math.random()* (ctx.expRandom- 1)
	return ctx.expFactor* (rf+ 1)
}
exponentiator.exponentiator= exponentiator
exponentiator.expFactor= 1.618
exponentiator.expRandom= 1.618

export function Retry( operation, opt){
	const ctx= Object.assign({
		operation,
		retries: Number.POSITIVE_INFINITY,
		count: 0,
		minTimeout: 1000,
		maxTimeout: MINUTES_10,
		delay: 0, // current delay
		timeout: -1,
		...exponentiator
	}, opt)
	const machine= createMachine({
		initial: state(
			transition( "start", "attempt")
		),
		attempt: invoke( attempter,
			transition( "done", "done"),
			transition( "error", "delay")
		),
		delay: invoke( delayer,
			transition( "done", "attempt"),
			transition( "error", "error")
		),
		done: final(),
		error: final()
	}, initial=> {
		return { ...ctx, ...initial}
	})
	return machine
}
export default Retry
