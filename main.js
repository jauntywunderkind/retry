#!/usr/bin/env node
import { execSync} from "child_process"
import Retry from "./retry.js"
import { interpret} from "robot3"

export function main( opt= {}){
	const
		process_= opt.process|| process,
		argv= opt.argv|| process_.argv,
		cmd= argv.slice( 2),
		env= opt.env|| process_.env|| {},
		verbose= opt.verbose!== undefined? opt.verbose: (env.VERBOSE|| env.V),
		log= opt.log|| console.error,
		tStart= Date.now(),
		retryMachine= Retry( run, opt),
		retry= interpret( retryMachine, function( ctx){
			if( ctx.machine.current!== "delay"){
				return
			}
			if( verbose|| true){
				log( JSON.stringify({
					"retry": true,
					time: Date.now()- tStart,
					delay: ctx.context.delay,
					count: ctx.context.count
				}))
			}
		})
	function run(){
		execSync( cmd.join(" "), { ...opt})
	}
	retry.send( "start")
}
export default main

if( typeof process!== "undefined"&& `file://${process.argv[ 1]}`=== import.meta.url){
	main()
}
