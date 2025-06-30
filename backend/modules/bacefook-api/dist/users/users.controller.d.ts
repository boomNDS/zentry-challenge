import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        bio: string | null;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
        referredById: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        bio: string;
        avatar: string;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            referrals: number;
            friends: number;
            referralPoints: number;
        };
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        bio: string;
        avatar: string;
        createdAt: Date;
        updatedAt: Date;
        referrals: {
            id: string;
            username: string;
            firstName: string;
            lastName: string;
            avatar: string;
        }[];
        friends: {
            id: string;
            username: string;
            firstName: string;
            lastName: string;
            avatar: string;
        }[];
        _count: {
            referrals: number;
            friends: number;
            referralPoints: number;
        };
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        bio: string | null;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
        referredById: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
