import Feedstories from "./Feedstories"
import Feed from "./Feed";

const RegularUserPage = () => {
    return (
        <div className="py-5 py-md-0 mt-2 mt-md-0">
            <Feedstories type="me" />

            <Feed />
        </div>
    );
};

export default RegularUserPage;
