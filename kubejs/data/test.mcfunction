summon zombie 7.5 -60 -47.5 {Tags:["enemy"], ArmorItems:[{},{},{},{id: "iron_helmet",Count:1}]}
summon zombie_horse 7.5 -60 -47.5 { Passengers:[{id:"minecraft:zombie", Tags:["enemy"]}], Tags:["enemy"]}
summon drowned 7.5 -60 -47.5 {Tags:["enemy"]}

summon skeleton 7.5 -60 -47.5 {HandItems:[{id:"minecraft:bow",Count:1},{}],Tags:["enemy"]}
summon skeleton_horse 7.5 -60 -47.5 { Passengers:[{id:"minecraft:skeleton",HandItems:[{id:"minecraft:bow",Count:1},{}],Tags:["enemy"]}],Tags:["enemy"]}

summon creeper 7.5 -60 -47.5 {Tags:["enemy"]}

summon spider 7.5 -60 -47.5 {Tags:["enemy"]}

summon vindicator 7.5 -60 -47.5 {HandItems:[{id:"minecraft:iron_axe",Count:1},{}],Tags:["enemy"]}
summon pillager 7.5 -60 -47.5 {HandItems:[{id:"minecraft:crossbow",Count:1},{}],Tags:["enemy"]}
summon ravager 7.5 -60 -47.5 { Passengers:[{id:"minecraft:pillager",HandItems:[{id:"minecraft:crossbow",Count:1},{}],Tags:["enemy"]}],Tags:["enemy"]}

summon slime 7.5 -60 -47.5 {Tags:["enemy"], Size:4}

spreadplayers 7.5 -31.5 0.1 4 false @e[tag=enemy,x=7.5,y=-60,z=-47.5,distance=..4]

summon skeleton 7.5 -60 -31.5 {HandItems:[{id:"minecraft:bow",Count:1},{}],Tags:["enemy"]}
execute as @e[tag=enemy] at @s run setblock ~ ~ ~ oak_planks
execute as @e[tag=enemy] at @s run fill ~ ~ ~ ~1 ~1 ~1 oak_planks

give @a iron_chestplate{Unbreakable:true} 1

tp @e[x=0,y=0,z=0,distance=..3] @p