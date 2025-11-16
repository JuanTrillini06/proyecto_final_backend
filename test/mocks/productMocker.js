import {faker} from '@faker-js/faker'


export const generateMockProducts = (count = 1) => {
    const products = [];

    for (let i = 0; i < count; i++) {
        const product = {
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: faker.commerce.price(),
            code: faker.string.uuid(),
            stock: faker.number.int({ min: 0, max: 100 }),
            status: faker.datatype.boolean(),
            category: faker.commerce.department()
        };

        products.push(product);
    }

    return products
}