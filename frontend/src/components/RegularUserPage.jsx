import FeedStories from "./Feedstories"
import Feed from "./Feed";

const RegularUserPage = () => {
    return (
        <div className="py-5 py-md-0 mt-5 mt-md-0">
            <FeedStories type="all" />
            <Feed />
        </div>
    );
};

export default RegularUserPage;
