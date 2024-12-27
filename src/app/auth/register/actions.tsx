// src/app/auth/register/actions.ts
"use server"

import bcrypt from "bcryptjs"
import { redisClient } from "@/lib/redis"

export async function createUser(formData: FormData) {
  const firstName = formData.get("firstName")?.toString() || ""
  const lastName = formData.get("lastName")?.toString() || ""
  const emailRaw = formData.get("email")?.toString() // optional
  const passwordRaw = formData.get("password")?.toString() || ""

  if (!firstName || !lastName || !passwordRaw) {
    throw new Error("Missing required fields: firstName, lastName, or password.")
  }

  const email = emailRaw || ""

  // Hash the password using bcryptjs (no need for dynamic import)
  const hashedPassword = await bcrypt.hash(passwordRaw, 10)

  // Generate a user ID (demo approach)
  const userId = Date.now().toString()

  await redisClient.hSet(`user:${userId}`, {
    firstName,
    lastName,
    email,
    password: hashedPassword,
  })

  await redisClient.sAdd("allUsers", userId)

  return userId
}
