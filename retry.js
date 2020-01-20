import Delay from "delay"

class AsyncRetryPromise extends Promise{
	static get [Symbol.species](){
		return Promise
	}
	constructor( factory, ...opt){
		let res, rej
		super( function( res_, rej_){
			res= res_
			rej= rej_
		})

		// set properties
		Object.defineProperties( this, {
			factory: {
				value: factory,
				writable: true
			},
			remaining: {
				value: factory.retries,
				writable: true
			},
		});
	
		// start work
		(async ()=> {
			// start execution
			let ex
			while( this.remaining!== 0){
				// try
				try{
					const value= await this.fn( ...opt)
					res( value)
					return
				}catch( e){
					ex= e
				}
				// consume try
				--this.remaining

				// delay
				const delay= this.delay
				if( delay!== undefined){
					await Delay( delay)
				}

				// fire onRetry
				const onRetry= this.onRetry
				if( onRetry){
					try {
						onRetry.call( this)
					}catch( ex){
					}
				}
			}
			rej_( ex)
		})()
		return this
	}

	get delay(){
		return this._get( "delay", true)
	}
	get fn(){
		return this._get( "fn", true)
	}
	get onRetry(){
		return this._get( "onRetry", true)
	}
	get retries(){
		return this._get( "retries", true)
	}
	_get( name, noThis= false){
		let value
		if( !noThis){
			value= this[ name]
		}
		if( value=== undefined){
			value= this.factory[ name]
		}
		if( name!== "fn"&& value instanceof Function){
			value= value.call( this)
		}
		return value
	}
}

export function factory( fn, opt){
	if( fn.fn&& opt=== undefined){
		opt= fn
		fn= opt.fn
	}
	if( !this|| this=== globalThis){
		return new factory( fn, opt)
	}

	this.delay= opt&& opt.delay
	this.fn= fn
	this.onRetry= opt&& opt.onRetry
	this.retries= opt&& opt.retries|| 10
	if( isNaN( this.retries)){
		throw new Error( `Invalid 'retries': '${this.retries}'`)
	}
	return ( ...opt)=> {
		return new AsyncRetryPromise( this, ...opt)
	}
}
export default factory
