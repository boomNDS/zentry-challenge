import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, SearchUsersDto } from './dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        bio: string;
        avatar: string;
        createdAt: Date;
        updatedAt: Date;
        friends: Pick<{
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
        }, "id" | "username" | "firstName" | "lastName" | "avatar">[];
        referrals: Pick<{
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
        }, "id" | "username" | "firstName" | "lastName" | "avatar">[];
        referralPoints: number;
        networkStrength: number;
    }>;
    findAll(query: SearchUsersDto): Promise<{
        data: {
            id: string;
            email: string;
            username: string;
            firstName: string;
            lastName: string;
            bio: string;
            avatar: string;
            createdAt: Date;
            updatedAt: Date;
            friends: {
                id: string;
                username: string;
                firstName: string;
                lastName: string;
                avatar: string;
            }[];
            referrals: {
                id: string;
                username: string;
                firstName: string;
                lastName: string;
                avatar: string;
            }[];
            referralPoints: number;
            networkStrength: number;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
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
        friends: Pick<{
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
        }, "id" | "username" | "firstName" | "lastName" | "avatar">[];
        referrals: Pick<{
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
        }, "id" | "username" | "firstName" | "lastName" | "avatar">[];
        referralPoints: number;
        networkStrength: number;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        bio: string;
        avatar: string;
        createdAt: Date;
        updatedAt: Date;
        friends: Pick<{
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
        }, "id" | "username" | "firstName" | "lastName" | "avatar">[];
        referrals: Pick<{
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
        }, "id" | "username" | "firstName" | "lastName" | "avatar">[];
        referralPoints: number;
        networkStrength: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
