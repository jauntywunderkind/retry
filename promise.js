import PromiseUnderlie from "promise-underlie/promise-underlie.js"
import { interpret} from "robot3"
import Interpret from "./retry.js"

export function Retry( fn, opt){
	if( !( this instanceof Retry)){
		return new Retry( fn, opt)
	}
	let _res, _rej
	this.promise= new Promise( function( resolve, reject){
		_res= resolve
		_rej= reject
	})

	const _onChange= opt.onChange
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

	this.interpret= Interpret( fn, { ...opt, onChange})
	return this
}
PromiseUnderlie( Retry)
export {
	Retry as default,
	Retry as RetryPromise
}
