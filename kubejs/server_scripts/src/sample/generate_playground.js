// priority: 0

ServerEvents.commandRegistry(event => {
	const { commands: Commands, arguments: Arguments } = event

	// event.register(Commands.literal('playground')
    //     .executes(c => playground(c.source.player))
    // )
    let playground = (player) => {
		let level = player.getLevel()
		Array(200).fill().forEach(() => {
			let newArmorStand = level.createEntity("minecraft:armor_stand")
			newArmorStand.spawn()
			newArmorStand.persistentData.putBoolean("block", true);
			if (Math.random() > 0.5) {
				newArmorStand.mergeNbt({"Tags":["Block","BigBlock"]});
			} else {
				newArmorStand.mergeNbt({"Tags":["Block","SmallBlock"]});
			}
		});
		level.getServer().runCommandSilent("/spreadplayers 0 0 2 45 false @e[tag=Block,type=armor_stand]")
		level.getServer().runCommandSilent("/spreadplayers 0 0 5 32 false @e[tag=Block,type=armor_stand,x=0,y=-60,z=0,distance=45..]")
		// ↑把落在场地外的盔甲架再召唤回中心
		level.getServer().runCommandSilent("/execute as @e[tag=SmallBlock] at @s run setblock ~ ~ ~ oak_planks")
		level.getServer().runCommandSilent("/execute as @e[tag=BigBlock] at @s run fill ~ ~ ~ ~1 ~1 ~1 oak_planks")
		level.getServer().runCommandSilent("/kill @e[tag=Block,type=armor_stand]")

		return 1;
	}

	// event.register(Commands.literal('enemy')
	// 	.executes(c => enemy(c.source.player,-1))
	// 	.then(Commands.argument("value", Arguments.INTEGER.create(event))
	// 		.executes(c => enemy(c.source.player,Arguments.INTEGER.getResult(c, "value")))
	// 	)
	// )
	let enemy=(player,amount)=>{
		let level = player.getLevel()
		genEnemy(level, amount, 'zombie', '')
		// genEnemy(level, amount, 'skeleton', 'bow')
		// genEnemy(level, amount, 'creeper', '')
		
		return 1;
	}

	function genEnemy(level, amount, type, handItem) {
		Array(parseInt(amount)).fill().forEach(() => {
			let newEnemy = level.createEntity(`minecraft:${type}`)
			newEnemy.spawn()
			newEnemy.persistentData.putBoolean("enemy", true);
			let nbt = newEnemy.getNbt()
			nbt.HandItems = [{id:handItem,Count:1},{}];
			nbt.Tags = [];
			nbt.Tags.push("Enemy");
			newEnemy.mergeNbt(nbt);
		});
		level.getServer().runCommandSilent(`/spreadplayers 0 0 1 45 false @e[tag=Enemy,type=${type}]`)
		level.getServer().runCommandSilent(`/spreadplayers 0 0 3 32 false @e[tag=Enemy,type=${type},x=0,y=-60,z=0,distance=45..]`)
	}
})