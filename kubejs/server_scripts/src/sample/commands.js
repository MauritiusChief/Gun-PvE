let Blacklisted_Entity = ["minecraft:ender_dragon", "minecraft:wither", "minecraft:skeleton", "minecraft:skeleton_horse", "minecraft:stray", "minecraft:wither_skeleton"]

ServerEvents.commandRegistry(event => {
	const { commands: Commands, arguments: Arguments } = event

	event.register(Commands.literal('hunter')
        .executes(c => hunter(c.source.player))
    )
    let hunter = (player) => {
		let reverseStat = !player.persistentData.getBoolean("huntgame");
        player.persistentData.putBoolean("huntgame", reverseStat);
		return 1;
	}
})