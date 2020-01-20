import Delay from "delay"

export function AsyncRetry( fn, opt){
	if( fn.fn&& opt=== undefined){
		opt= fn
		fn= opt.fn
	}
	const
		name= `${fn.name||""}Retrier`,
		factory= {[ name]: function( ...opt){
			let p
			p= new Promise( async (resolve, reject)=> {
				let ex
				while( !p|| p.remaining!== 0){
					try{
						const value= await factory.fn.call( this, ...opt)
						resolve( value)
						return
					}catch( e){
						ex= e
					}
					if( p.delay){
						await Delay( p.delay)
					}
					--p.remaining
					if( p.onRetry){
						try {
							p.onRetry( ex)
						}catch( ex){
						}
					}
				}
				reject( ex)
			})
			p.tries= p.remaining= factory.tries
			p.delay= factory.delay
			p.onRetry= factory.onRetry
			return p
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
