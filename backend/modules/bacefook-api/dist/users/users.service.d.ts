import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
export declare class UsersService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        bio: string | null;
        avatar: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        bio: string;
        avatar: string;
        id: string;
        createdAt: Date;
        _count: {
            posts: number;
            followers: number;
            following: number;
        };
    }[]>;
    findOne(id: string): Promise<{
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        bio: string;
        avatar: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        posts: {
            content: string;
            id: string;
            createdAt: Date;
            _count: {
                comments: number;
                likes: number;
            };
            imageUrl: string;
        }[];
        _count: {
            posts: number;
            followers: number;
            following: number;
        };
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        bio: string | null;
        avatar: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
