import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../../components/ui/Loading";
import { categoryService } from "../../services/categories";

export default function Category() {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(null);
    const [subcategory, setSubcategory] = useState([]);
    const [listings, setListings] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await categoryService.getCategoryBySlug(slug);
            if (res.success) {
                setListings(res.listings);
                setCategory(res.data);
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (loading) return <Loading />

    return (
        <div style={{
            // display: 'flex',
            // alignItems: 'center',
            // flexDirection: 'column',
            // justifyContent: 'center',
            height: '100vh',
            // textAlign: 'center',
            marginTop: '11rem'
        }}>
            <div
                style={{
                    height: '50vh',
                    width: '100%',
                    position: 'relative',
                }}
            >
                <img
                    style={{
                        height: '100%',
                        width: '100%',
                        // position: 'relative',
                        objectFit: 'cover'
                    }} src={category.image} alt={category.slug} crossOrigin="anonymous" />
            </div>
            <div className="bottom-header"
                style={{
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    scrollbarWidth: 'thin',
                    justifyContent: 'space-around',
                    padding: '5px',
                }}
            >
                {category.children.map((cat, index) => (
                    <div
                        key={index}
                        id={cat.id}
                        className="bottom-header-item"
                        style={{
                            margin: '5px',
                            fontSize: '15px'
                        }}
                    >
                        <Link
                            style={{
                                display: 'flex',
                                padding: '5px',
                                alignItems: 'center',
                                borderRadius: '18px',
                                backgroundColor: '#ffffff',
                                textDecoration: 'none',
                                color: '#000',
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                            }}
                            to={`/category/${category.slug}/subcategory/${cat.slug}`}>
                            <img
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    // position: 'relative',
                                    objectFit: 'cover'
                                }}
                                src={cat.image}
                                alt={cat.slug}
                                crossOrigin="anonymous"
                            />
                            <span>{cat.name}</span>
                        </Link>
                    </div>
                ))}
            </div>
            <h1> Catégorie {category.name}</h1>
        </div>
    );
};
