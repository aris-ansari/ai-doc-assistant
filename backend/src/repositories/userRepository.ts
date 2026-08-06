import { User, IUser } from "../models/User";

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select("+passwordHash").exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    return User.create(userData);
  }

  async updatePassword(
    id: string,
    passwordHash: string,
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { passwordHash }, { new: true }).exec();
  }
}

export const userRepository = new UserRepository();
