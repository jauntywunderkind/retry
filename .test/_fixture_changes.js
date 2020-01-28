export function Changes(){
	function changes( ctx){
		const
			current= ctx.machine.current,
			currentCount= (changes[ current]|| 0)+ 1
		changes[ current]= currentCount
		++changes.count
	}
	changes.count= 0
	return changes
}
export default Changes
