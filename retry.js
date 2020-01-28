#!/usr/bin/env node
import Delay from "delay"
import { createMachine, state as final, interpret as Interpret, invoke, reduce, state, transition} from "robot3"

const MINUTES_10= 1000* 60* 10

export async function delayer( ctx){
	ctx.delay= _delayer( ctx)
	return Delay( ctx.delay)
}

export async function attempter( ctx){
	++ctx.count
	return ctx.operation()
}

export function _delayer( ctx){
	if( ctx.retries>= 0&& ctx.count>= ctx.retries){
		throw new Error("No retries left")
	}
	const
		mult= ctx.exponentiator( ctx),
		delay= mult* (ctx.delay|| 0)
	if( ctx.minTimeout>= 0&& delay< ctx.minTimeout){
		return ctx.minTimeout
	}
	if( ctx.maxTimeout>= 0&& delay> ctx.maxTimeout){
		return ctx.maxTimeout
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

export function makeInitializer( /*optional*/ operation, opt){
	if( typeof operation!== "function"&& opt=== undefined){
		opt= operation
		operation= opt.operation
	}
	return function initializer( initial){
		return {
			retries: Number.POSITIVE_INFINITY,
			count: 0,
			minTimeout: 1000,
			maxTimeout: MINUTES_10,
			delay: 0, // current delay
			timeout: -1,
			...exponentiator,
			...opt,
			operation,
			...initial
		}
	}
}

const saveResult= reduce( function saveResult( ctx, ev){
	ctx.result= ev.data
	ctx.error= null
	return ctx
})
const saveError= reduce( function saveError( ctx, ev){
	ctx.error= ev.error
	return ctx
})

export const machine= {
	initial: state(
		transition( "start", "attempt")
	),
	attempt: invoke( attempter,
		transition( "done", "done", saveResult),
		transition( "error", "delay", saveError)
	),
	delay: invoke( delayer,
		transition( "done", "attempt"),
		transition( "error", "error")
	),
	done: final(),
	error: final()
}
export {
	machine as Machine,
	machine as RetryMachine
}

export function Retry( operation, opt){
	const machine_= createMachine(
		machine,
		makeInitializer( operation, opt)
	)
	return machine_
}
export default Retry

export function interpret( operation, opt= {}){
	const
		machine= Retry( operation, opt),
		interpret= Interpret( machine, opt.onChange|| function(){})
	if( opt.start!== false){
		Delay( 0).then( function(){
			interpret.send( "start")
		})
	}
	return interpret
}
export {
	interpret as Interpret,
	interpret as RetryInterpret
}

if( typeof process!== "undefined"&& `file://${process.argv[ 1]}`=== import.meta.url){
	import( "./main.js").then( main=> main.default())
}
