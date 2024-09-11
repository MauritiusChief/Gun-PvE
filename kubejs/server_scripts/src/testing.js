
// 测试特定波次的敌人
ServerEvents.commandRegistry(event => {
	const { commands: Commands, arguments: Arguments } = event

    // 测试波次指令
	event.register(Commands.literal('testwave')
		.executes(c => testwave(c.source.player,-1))
		.then(Commands.argument("value", Arguments.INTEGER.create(event))
			.executes(c => testwave(c.source.player,Arguments.INTEGER.getResult(c, "value")))
		)
	)
	let testwave=(player,wave_number)=>{
		let level = player.getLevel()

        generate_wave(level, MAP_POS, wave_number)
        // generate_enemy(level, MAP_POS, 'norm', 0, 2)
		return 1;
	}
    
    // 设置阵营指令
    event.register(Commands.literal('side')
		.executes(c => side(c.source.player,-1))
		.then(Commands.argument("value", Arguments.INTEGER.create(event))
			.executes(c => side(c.source.player,Arguments.INTEGER.getResult(c, "value")))
		)
	)
    let side = (player,side) => {
        player.persistentData.putInt("side", side);
		return 1;
	}
})

// function genEnemy(level, wave_number, type, handItem) {
//     let newEnemy = level.createEntity(`minecraft:${type}`)
//     newEnemy.spawn()
//     newEnemy.persistentData.putBoolean("enemy", true);
//     newEnemy.persistentData.putInt("navi_code", 113)
//     newEnemy.persistentData.putInt("navi_count_down", 1)
//     let nbt = newEnemy.getNbt()
//     nbt.HandItems = [{id:handItem,Count:1},{}];
//     nbt.Tags = [];
//     nbt.Tags.push("Enemy");
//     nbt.PersistenceRequired = true;
//     newEnemy.mergeNbt(nbt);
//     level.getServer().runCommandSilent(`/tp @e[x=0,y=0,z=0,distance=..3] @p`)
// }
