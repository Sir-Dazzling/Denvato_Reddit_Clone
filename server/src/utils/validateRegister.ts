import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) =>
{
    if (options.username.length <= 2)
    {
        return [
            {
                field: "username",
                message: "username must be greater than 2"
            }
        ];
    }

    if (options.username.includes("@"))
    {
        return [
            {
                field: "username",
                message: "username cannot include @ character"
            }
        ];
    }

    if (options.password.length <= 3)
    {
        return [
            {
                field: "password",
                message: "password must be greater than 3"
            }
        ];
    }

    if (!options.email.includes("@"))
    {
        return [
            {
                field: "email",
                message: "Invalid email"
            }
        ];
    }

    return null;
}