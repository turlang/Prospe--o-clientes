import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AppError } from "../../errors/AppError.js";
import { prisma } from "../../lib/prisma.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true
};

/**
 * Emite um token com emissor, audiência e algoritmo fixos.
 */
function signAccessToken(user) {
  return jwt.sign(
    { role: user.role },
    env.JWT_SECRET,
    {
      algorithm: "HS256",
      subject: user.id,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
}

export async function registerCustomer(input) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

  if (existingUser) {
    throw new AppError("E-mail já cadastrado.", 409, "EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: "CUSTOMER"
    },
    select: publicUserSelect
  });

  return { user, token: signAccessToken(user) };
}

export async function login(input) {
  const userWithPassword = await prisma.user.findUnique({ where: { email: input.email } });

  if (!userWithPassword) {
    throw new AppError("E-mail ou senha inválidos.", 401, "INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(input.password, userWithPassword.passwordHash);

  if (!passwordMatches) {
    throw new AppError("E-mail ou senha inválidos.", 401, "INVALID_CREDENTIALS");
  }

  const user = {
    id: userWithPassword.id,
    name: userWithPassword.name,
    email: userWithPassword.email,
    role: userWithPassword.role,
    createdAt: userWithPassword.createdAt
  };

  return { user, token: signAccessToken(user) };
}
