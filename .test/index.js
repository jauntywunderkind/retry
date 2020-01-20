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
	const
		fn= Fail(),
		retry= Retry( fn),
		got= await retry()
	t.pass( "eventual success")
	t.end()
})

tape( "can delay", async function( t){
	const
		tStart= Date.now(),
		fn= Fail( 2),
		retry= Retry( fn,{ delay: 5}),
		got= await retry(),
		diff= Date.now()- tStart
	t.ok( diff>= 9, "two delays")
	t.end()
})
