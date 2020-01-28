#!/usr/bin/env node
import tape from "tape"

import Fail from "./_fixture_fail.js"

tape( "fixture", async function( t){
	t.plan( 4)
	const fail= Fail( 1)
	try{
		await fail()
		t.fail( "did not fail")
	}catch( ex){
		t.pass( "expected-fail")
		t.equal( fail.count, 1, "count=1")
	}
	await fail()
	t.pass( "pass")
	t.equal( fail.count, 2, "count=2")
	t.end()
})


