#!/usr/bin/env node
import Delay from "delay"
import { interpret} from "robot3"
import tape from "tape"

import Retry from "../retry.js"
import Changes from "./_fixture_changes.js"
import Fail from "./_fixture_fail.js"
import {} from "./_fixture_fail.test.js"

const noMinTimeout= {
	minTimeout: 0
}

tape( "can retry", async function( t){
	t.plan( 4)
	const
		fail= Fail(),
		changes= Changes(),
		retryMachine= Retry( fail, noMinTimeout),
		retry= interpret( retryMachine, changes)
	retry.send( "start")
	await Delay( 3)

	t.equal( changes.attempt, 2, "saw attempt=2")
	t.equal( changes.delay, 1, "saw retry=1")
	t.equal( changes.done, 1, "saw done=1")
	t.equal( retry.context.count, 2, "count=2")
	t.end()
})

tape( "can delay", async function( t){
	t.end()
})
