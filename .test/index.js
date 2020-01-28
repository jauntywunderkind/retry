#!/usr/bin/env node
import Delay from "delay"
import { interpret} from "robot3"
import tape from "tape"

import Retry, { Interpret} from "../retry.js"
import Changes from "./_fixture_changes.js"
import Fail from "./_fixture_fail.js"
import {} from "./_fixture_fail.test.js"

tape( "can retry", async function( t){
	t.plan( 5)
	const
		fail= Fail(),
		changes= Changes( function(){
			t.equal( changes.attempt, 2, "saw attempt=2")
			t.equal( changes.delay, 1, "saw retry=1")
			t.equal( changes.done, 1, "saw done=1")
			t.equal( retry.context.count, 2, "count=2")
			t.equal( retry.context.result, 42, "result=42")
			t.end()
		}),
		retryMachine= Retry( fail, { minTimeout: 0}),
		retry= interpret( retryMachine, changes)
	retry.send( "start")
})

tape( "can delay", async function( t){
	t.plan( 3)
	const
		start= Date.now(),
		fail= Fail( 2),
		changes= Changes( function(){
			t.ok( Date.now()- start>= 8, "time>=8")
			t.ok( retry.context.delay>= 4*1.618, `delay>=min`)
			t.equal( retry.context.count, 3, "count=3")
			t.end()
		}),
		retryMachine= Retry( fail, { minTimeout: 4}),
		retry= interpret( retryMachine, changes)
	retry.send( "start")
})

tape( "can set exponentiation factor", async function( t){
	t.plan( 1)
	const
		start= Date.now(),
		fail= Fail( 1),
		changes= Changes( function(){
			t.equal( retry.context.delay, 4, "delay=4")
			t.end()
		}),
		retryMachine= Retry( fail, { minTimeout: 4, expFactor: 3}),
		retry= interpret( retryMachine, changes)
	retry.send( "start")
})

tape( "interpret helper", async function( t){
	t.plan( 1)
	const
		fail= Fail(),
		onChange= Changes( function(){
			t.equal( retry.context.count, 2, "count=2")
			t.end()
		}),
		retry= Interpret( fail,{ minTimeout: 0, onChange})
})

tape( "can run out of retries", async function( t){
	t.plan( 3)
	const
		fail= Fail( 2),
		onChange= Changes( function( ctx){
			t.equal( retry.context.count, 2, "count=2")
			t.equal( retry.machine.current, "error", "state=error")
			t.ok( retry.context.error instanceof Error, "context has error")
			try{
				fail()
			}catch(ex){
				t.fail( "fail should have passed now")
			}
			t.end()
		}),
		retry= Interpret( fail,{ onChange, minTimeout: 0, onChange, tries: 2})
})
