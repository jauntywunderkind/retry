import Delay from "delay"
import PromiseUnderlie from "promise-underlie/promise-underlie.js"
import { interpret} from "robot3"
import { Interpret} from "./retry.js"

export function Retry( fn, opt= {}){
	if( !( this instanceof Retry)){
		return new Retry( fn, opt)
	}
	let _res, _rej
	const promise= new Promise( function( resolve, reject){
		_res= resolve
		_rej= reject
	})

	// create a wrapper onChange that does user + our handler
	let _onChange= opt.onChange
	function onChange( ctx, ev){
		if( _onChange){
			_onChange( ctx, ev)
		}

		const current= ctx.machine.current
		if( current=== "done"){
			_res( ctx.result)
		}else if( current=== "error"){
			_rej( ctx.error)
		}
	}

	const interpret= Interpret( fn, { ...opt, onChange})
	Object.defineProperties( this, {
		promise: {
			value: promise
		},
		interpret: {
			value: interpret
		},
		onChange: {
			get: function(){
				return _onChange
			},
			set: function( onChange){
				_onChange= onChange
			}
		},
		context: {
			get: function(){
				return this.interpret.context
			}
		},
		machine: {
			get: function(){
				return this.interpret.machine
			}
		},
		send: {
			get: function( value){
				return this.interpret.send( value)
			}
		}
	})
	return this
}
PromiseUnderlie( Retry)
export {
	Retry as default,
	Retry as RetryPromise
}
