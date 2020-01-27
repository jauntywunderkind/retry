#!/usr/bin/env node
import tape from "tape"
import Retry from "../retry.js"
import Fail from "./_fixture_fail.js"

tape( "fixture", async function( t){
	t.plan( 2)
	const fail= Fail()
	try{
		await fail()
		t.fail( "fail did not fail")
	}catch( ex){
		t.pass( "fail fails first time")
	}
	await fail()
	t.pass( "fail passes second time")
	t.end()
})

tape( "can retry", async function( t){
	t.end()
})

tape( "can delay", async function( t){
	t.end()
})
