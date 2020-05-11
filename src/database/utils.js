import jwt from 'jsonwebtoken';
import User from "./models/User";

export const getRamdomBetween = (min, max) => Math.random() * (max - min) + min;

export const random = total => getRamdomBetween(0, total);

export const generateNumber = (total, numbers) => {
    let selected = 0;
    const r = random(total);

    numbers.reduce((acc, cur, index) => {
        if (r > acc && r <= acc + cur) {
            selected = index;
        }
        return acc + cur
    }, 0);

    return selected;
};

export const getUserWithToken = async (token) => {
    const tokenDecoded = jwt.verify(token, process.env.JWT_KEY || 'Prout123');

    return await User.findById(tokenDecoded.token);
};
