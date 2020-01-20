export function FixtureFail( fails= 1){
	async function Fail(){
		// while fails
		if( Fail.fails-- > 0){
			// fail
			throw new Error( "Fixture deliberately failed")
		}
	}
	Fail.fails= fails
	return Fail
}
export default FixtureFail
