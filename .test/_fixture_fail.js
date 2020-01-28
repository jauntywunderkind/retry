export function FixtureFail( fails= 1){
	async function Fail(){
		// while fails
		if( Fail.count++< Fail.fails){
			// fail
			throw new Error( "Fixture deliberately failed")
		}
		return 42
	}
	Fail.count= 0
	Fail.fails= fails
	return Fail
}
export default FixtureFail
