// Pagination.jsx
export default function Pagination({ currentPage, totalPages, setCurrentPage }) {
    return (
        <div className="list-pagination">
            <button
                className="stores-list-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
            >
                Précédent
            </button>

            {[...Array(totalPages).keys()].map((page) => (
                <button
                    key={page + 1}
                    onClick={() => setCurrentPage(page + 1)}
                    className={`stores-list-btn ${currentPage === page + 1 ? 'active' : ''}`}
                >
                    {page + 1}
                </button>
            ))}

            <button
                className="stores-list-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                Suivant
            </button>
        </div>
    );
}
