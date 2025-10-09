export const sanitizeUser = (user) => {
    if (!user) return null;
    const {
        _id,
        first_name,
        last_name,
        email,
        age,
        role,
        cart
    } = user;
    return {
        _id,
        first_name,
        last_name,
        email,
        age,
        role,
        cart
    };
};
