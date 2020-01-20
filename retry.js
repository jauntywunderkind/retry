import Delay from "delay"

export function AsyncRetryPromise( factory, ...opt){
	if( this=== undefined){
		throw new Error("fuck this")
	}
	console.log( "promise?", this instanceof Promise)

	// initialize promise
	let res, rej
	Promise.call( this, function(res_, rej_){
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
	})

	// start work
	(async ()=> {
		// start execution
		let ex
		while( this.remaining!== 0){
			// try
			try{
				const value= await this.fn( ...opt)
				resolve( value)
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
		reject( ex)
	})()
	return this
}
AsyncRetryPromise.prototype= Object.create( Promise.prototype, {
	delay: {
		get: function(){
			return this._calc( "delay", true)
		},
		configurable: true
	},
	fn: {
		get: function(){
			return this._calc( "fn", true)
		},
		configurable: true
	},
	onRetry: {
		get: function(){
			return this._calc( "onRetry", true)
		},
		configurable: true
	},
	retries: {
		get: function(){
			return this._calc( "retries", true)
		},
		configurable: true
	},
	_get: {
		value: function( name, noThis= false){
			let value
			if( !noThis){
				value= this[ name]
			}
			if( value=== undefined){
				value= this.factory[ name]
			}
			if( value instanceof Function){
				value= value.call( this)
			}
			return value
		}
	}
})
AsyncRetryPromise.prototype.constructor= AsyncRetryPromise

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
	this.retries= opt&& opt.retries|| -1
	if( isNaN( this.retries)){
		throw new Error( `Invalid 'retries': '${this.retries}'`)
	}
	return ( ...opt)=> {
		return new AsyncRetryPromise( this, ...opt)
	}
}
export default factory
