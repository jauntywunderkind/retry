import Delay from "delay"

export function AsyncRetry( fn, opt){
	if( fn.fn&& opt=== undefined){
		opt= fn
		fn= opt.fn
	}
	const
		name= `${fn.name||""}Retrier`,
		factory= {[ name]: function( ...opt){
			let res
			function calc( name){
				let value= res[ name]
				if( value=== undefined){
					value= res.factory[ name]
				}
				if( value instanceof Function){
					value= value.call( p)
				}
				return value
			}

			res= new Promise( async (resolve, reject)=> {
				let ex
				while( !res|| res.remaining!== 0){
					// try
					try{
						const value= await factory.fn.call( this, ...opt)
						resolve( value)
						return
					}catch( e){
						ex= e
					}
					// consume try
					--res.remaining

					// delay
					const delay= calc( "delay")
					if( delay!== undefined){
						await Delay( delay)
					}

					// fire onRetry
					const retry= calc( "onRetry")
					if( retry){
						try {
							retry.call( res)
						}catch( ex){
						}
					}
				}
				reject( ex)
			})
			res.start= Date.now()
			res.factory= factory
			return res
		}}[ name]
	factory.fn= fn
	factory.delay= opt&& opt.delay
	factory.tries= opt&& opt.tries|| -1
	factory.onRetry= opt&& opt.onRetry
	if( isNaN( factory.tries)){
		throw new Error( `Invalid tries '${factory.tries}'`)
	}
	return factory
}
export default AsyncRetry
