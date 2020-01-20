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
				}
				reject( ex)
			})
			p.tries= p.remaining= factory.tries
			p.delay= factory.delay
			return p
		}}[ name]
	factory.fn= fn
	factory.delay= opt&& opt.delay
	factory.tries= opt&& opt.tries|| -1
	if( isNaN( factory.tries)){
		throw new Error( `Invalid tries '${factory.tries}'`)
	}
	return factory
}
export default AsyncRetry
