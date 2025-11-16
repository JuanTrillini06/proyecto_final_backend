import express from 'express';
import { generateMockUsers } from '../mocks/userMocker.js';
import { generateMockProducts } from '../mocks/productMocker.js';
import userModel from '../../src/data/models/user.model.js';
import productModel from '../../src/data/models/product.model.js';

const router = express.Router();

router.post('/generateData', async (req, res) => {
    try {
        const { users = 0, products = 0 } = req.body;

        const mockUsers = generateMockUsers(users);
        const mockProducts = generateMockProducts(products);

        const insertedUsers = await userModel.insertMany(mockUsers);
        const insertedProducts = await productModel.insertMany(mockProducts);

        res.json({
            usersInserted: insertedUsers.length,
            productsInserted: insertedProducts.length,
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Error al generar datos de mock' });
    }
});

export default router;