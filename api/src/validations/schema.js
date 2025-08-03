const { z } = require('zod');

exports.signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    username: z.string().min(3).max(20),
});

exports.loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});