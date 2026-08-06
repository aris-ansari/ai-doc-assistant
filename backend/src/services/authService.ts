import bcrypt from "bcryptjs";
import { userRepository, UserRepository } from "../repositories/userRepository";
import { generateTokens, verifyRefreshToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";
import { IUser } from "../models/User";

export class AuthService {
  private userRepo: UserRepository;

  constructor(userRepo = userRepository) {
    this.userRepo = userRepo;
  }

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<{
    user: Partial<IUser>;
    accessToken: string;
    refreshToken: string;
  }> {
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new AppError("Email address is already in use", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await this.userRepo.create({ name, email, passwordHash });
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    user: Partial<IUser>;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await this.userRepo.findById(decoded.userId);
      if (!user) {
        throw new AppError("User not found", 401);
      }

      return generateTokens(user._id.toString());
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }

  async getCurrentUser(userId: string): Promise<Partial<IUser>> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
