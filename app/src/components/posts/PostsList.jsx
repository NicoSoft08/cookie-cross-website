import '../../styles/posts/PostsList.scss';

export default function PostsList({ children }) {
    return (
        <div className='posts-list'>
            {children}
        </div>
    );
};
