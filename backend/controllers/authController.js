import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const register = async (req, res) => {
    const  { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if(userExists) {
            return res.status(422).json({ msg: 'Email already exists' })
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email, 
            password: passwordHash
        };

        const user = new User(userData);
        await user.save();

        console.log(`✅ Usuário criado: ${email}`);

        res.status(201).json({
            msg: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch(error){
        console.error('Register error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}


const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('🔐 Login attempt:', email);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        console.log('✅ Login completed:', email);
        res.status(200).json({
            msg: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        res.status(500).json({ msg: 'Internal server error' });
    }
};

export { register, login };