import { PrismaClient } from "@prisma/client"
import { leagueOfLegendsConfig, valorantConfig, tftConfig } from "../lib/game-config"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting database seeding...")

  // Create games
  const games = [
    {
      name: leagueOfLegendsConfig.name,
      slug: leagueOfLegendsConfig.slug,
      description: "Climb the ranks with professional League of Legends boosting services.",
      imageUrl: leagueOfLegendsConfig.imageUrl,
    },
    {
      name: valorantConfig.name,
      slug: valorantConfig.slug,
      description: "Dominate the competition with expert Valorant boosting.",
      imageUrl: valorantConfig.imageUrl,
    },
    {
      name: tftConfig.name,
      slug: tftConfig.slug,
      description: "Master Teamfight Tactics with our professional boosting services.",
      imageUrl: tftConfig.imageUrl,
    },
  ]

  for (const gameData of games) {
    const existingGame = await prisma.game.findFirst({
      where: { name: gameData.name },
    })

    if (existingGame) {
      console.log(`Game ${gameData.name} already exists, updating...`)
      await prisma.game.update({
        where: { id: existingGame.id },
        data: gameData,
      })
    } else {
      console.log(`Creating game ${gameData.name}...`)
      await prisma.game.create({
        data: gameData,
      })
    }
  }

  // Create game types for each game
  const gameTypesByGame = [
    {
      gameName: leagueOfLegendsConfig.name,
      types: leagueOfLegendsConfig.boostTypes.map((bt) => ({
        name: bt.name,
        slug: bt.slug,
        description: bt.description,
      })),
    },
    {
      gameName: valorantConfig.name,
      types: valorantConfig.boostTypes.map((bt) => ({
        name: bt.name,
        slug: bt.slug,
        description: bt.description,
      })),
    },
    {
      gameName: tftConfig.name,
      types: tftConfig.boostTypes.map((bt) => ({
        name: bt.name,
        slug: bt.slug,
        description: bt.description,
      })),
    },
  ]

  for (const { gameName, types } of gameTypesByGame) {
    const game = await prisma.game.findFirst({
      where: { name: gameName },
    })

    if (!game) {
      console.log(`Game ${gameName} not found, skipping game types...`)
      continue
    }

    for (const typeData of types) {
      const existingType = await prisma.gameType.findFirst({
        where: {
          gameId: game.id,
          name: typeData.name,
        },
      })

      if (existingType) {
        console.log(`Game type ${typeData.name} for ${gameName} already exists, updating...`)
        await prisma.gameType.update({
          where: { id: existingType.id },
          data: {
            ...typeData,
            gameId: game.id,
          },
        })
      } else {
        console.log(`Creating game type ${typeData.name} for ${gameName}...`)
        await prisma.gameType.create({
          data: {
            ...typeData,
            gameId: game.id,
          },
        })
      }
    }
  }

  // Create a test user if none exists
  const testUser = await prisma.user.findFirst({
    where: { email: "test@example.com" },
  })

  if (!testUser) {
    console.log("Creating test user...")
    await prisma.user.create({
      data: {
        email: "test@example.com",
        password: "$2a$10$dJJsmPK2iGfh9gLr7fAkNOJ5iyLyYwfa3/OG6Kd.RFPpbgTiF9/1a", // hashed "password123"
        username: "TestUser",
        role: "CLIENT",
      },
    })
  }

  console.log("Database seeding completed!")
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
