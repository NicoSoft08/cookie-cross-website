export const postData = {
    details: {
        title: "Chemise Manche Longue Blanche Hugo Boss",
        price: 100,
    },
    category: 'fashion-and-beauty',
    subCategory: 'men-clothing',
    location: {
        address: "123 Rue de la République, Paris",
        city: "Paris",
        country: "France",
    },
    images: [
        "http://localhost:4000/api/categories/image/cat_1.png",
        "http://localhost:4000/api/categories/image/cat_2.png",
        "http://localhost:4000/api/categories/image/cat_3.png",
        "http://localhost:4000/api/categories/image/cat_4.png",
    ],
    store: {
        avatar: "https://res.cloudinary.com/duqadxv7q/image/upload/v1751116432/ehezhickwh2ggdiqpmjf.png",
        name: "Le Monde Africain",
        badges: ["verified", "pro"],
        slug: 'lemondeafricain',
    },
    createdAt: new Date(),
}