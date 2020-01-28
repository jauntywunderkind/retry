#!/usr/bin/env node
import tape from "tape"

import Retry from "../promise.js"
import Fail from "./_fixture_fail.js"

tape( "promise delay", async function( t){
	t.plan( 3)
	const	
		start= Date.now(),
		fail= Fail( 2),
		retry= Retry( fail, { minTimeout: 4}),
		result= await retry
	t.ok( Date.now()- start>= 8, "time>=8")
	t.ok( retry.context.delay>= 4*1.618, `delay>=min`)
	t.equal( retry.context.count, 3, "count=3")
	t.end()
})
