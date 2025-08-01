const { z } = require('zod');

const storeSchema = z.object({
    name: z.string().min(2).max(100),
    category: z.string().min(2).max(50),
    description: z.string().min(10).max(500),
});

module.exports = storeSchema;
