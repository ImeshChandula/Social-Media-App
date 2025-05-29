// src/components/StoryModal.jsx
const StoryModal = ({ story, onClose }) => {
    return (
        <div className="story-modal-overlay" onClick={onClose}>
            <div className="story-modal-content" onClick={(e) => e.stopPropagation()}>
                <img
                    src={story.mediaUrl}
                    alt="Story"
                    style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "12px" }}
                />
                <div className="text-white mt-2">{story.caption}</div>
            </div>
        </div>
    );
};

export default StoryModal;
