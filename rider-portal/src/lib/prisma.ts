import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaRider: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaRider ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaRider = prisma