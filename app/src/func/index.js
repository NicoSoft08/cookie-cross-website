const extractSuggestions = (categories, lang = "fr") => {
    let suggestions = [];

    categories?.forEach(category => {
        const categoryName = category.categoryTitle[lang];

        // Ajouter chaque sous-catégorie avec sa catégorie principale
        category?.container.forEach(sub => {
            suggestions.push({
                id: sub.sousCategoryId,
                name: sub.sousCategoryTitle[lang], // Nom de la sous-catégorie
                category: categoryName, // Catégorie principale
                type: "subCategory",
            });
        });

        // Ajouter la catégorie principale comme suggestion aussi
        suggestions.push({
            id: category.categoryId,
            name: categoryName,
            category: null, // Pas de catégorie parent pour une catégorie principale
            type: "category",
        });
    });

    return suggestions;
};

const formatPostedAt = (date, language) => {
    if (!date) return '';
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return language === 'FR' ? 'Hier' : 'Yesterday';
    } else if (diffDays < 7) {
        return language === 'FR' ? `Il y a ${diffDays} jours` : `${diffDays} days ago`;
    } else {
        return postDate.toLocaleDateString(language === 'FR' ? 'fr-FR' : 'en-US');
    }
};


export {
    extractSuggestions,
    formatPostedAt
};