import { User } from '../models/User.js';
import { ROLES } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../middleware/auth.js';

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email is already registered.', 409));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: ROLES.CUSTOMER,
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user: formatUser(user), token },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: formatUser(user), token },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: formatUser(req.user) },
  });
};
