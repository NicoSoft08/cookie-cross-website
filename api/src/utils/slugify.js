
const generateSlugBase = (text) => {
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ''); // Remove special characters
};

const generateUniqueSlug = async (name, prisma) => {
    const baseSlug = generateSlugBase(name);
    let slug = baseSlug;
    let suffix = 1;

    while (await prisma.store.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${suffix}`;
        suffix++;
    }

    return slug;
};

module.exports = { generateUniqueSlug };
