const Story = require('../models/Story');
const User = require('../models/User');
const { uploadFileToStorage } = require('../utils/fileUpload'); 

// Create a new story
const createStory = async (req, res) => {
  try {
    const userId = req.user.id;
    let mediaUrl = null;
    
    // Handle file upload if present
    if (req.file) {
      mediaUrl = await uploadFileToStorage(req.file, 'stories');
    }
    
    // Create story object
    const storyData = {
      userId,
      content: req.body.content,
      mediaUrl,
      type: req.body.type,
      caption: req.body.caption,
      filter: req.body.filter,
      backgroundColor: req.body.backgroundColor,
      textColor: req.body.textColor,
      font: req.body.font,
      privacy: req.body.privacy
    };
    
    const story = new Story(storyData);
    await story.save();
    
    res.status(201).json({ 
      message: 'Story created successfully', 
      story: { ...story, id: story.id } 
    });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user's stories
const getCurrentUserStories = async (req, res) => {
  try {
    const userId = req.user.id;
    const stories = await Story.findByUserId(userId);
    
    res.json(stories);
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get stories feed (current user + friends)
const getStoriesFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's friends
    const friendIds = currentUser.friends;
    
    // Add current user's ID to get their stories too
    const userIds = [userId, ...friendIds];
    
    // Get stories from these users
    const stories = await Story.getFriendsStories(userIds);
    
    // Group stories by user
    const storiesByUser = {};
    
    for (const story of stories) {
      if (!storiesByUser[story.userId]) {
        // Get user details for the story
        const user = await User.findById(story.userId);
        storiesByUser[story.userId] = {
          user: {
            id: user.id,
            username: user.username,
            profilePicture: user.profilePicture
          },
          stories: []
        };
      }
      
      storiesByUser[story.userId].stories.push(story);
    }
    
    res.json(Object.values(storiesByUser));
  } catch (error) {
    console.error('Error fetching stories feed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific story by ID
const getStoryById = async (req, res) => {
  try {
    const storyId = req.params.id;
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Check if story is expired
    if (story.isExpired()) {
      return res.status(410).json({ message: 'Story has expired' });
    }
    
    // Get user details for the story
    const user = await User.findById(story.userId);
    
    // Check if the current user has permission to view the story
    if (story.privacy === 'friends' && !user.friends.includes(req.user.id) && story.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to view this story' });
    }
    
    res.json({ 
      story,
      user: {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture
      } 
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark a story as viewed
const viewStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user.id;
    
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Check if story is expired
    if (story.isExpired()) {
      return res.status(410).json({ message: 'Story has expired' });
    }
    
    // Add viewer
    await story.addViewer(userId);
    
    res.json({ 
      message: 'Story viewed', 
      viewCount: story.viewCount 
    });
  } catch (error) {
    console.error('Error marking story as viewed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a story
const deleteStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    
    // Check if story exists
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Check if user owns the story
    if (story.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this story' });
    }
    
    // Delete the story
    await Story.findByIdAndDelete(storyId);
    
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createStory,
  getCurrentUserStories,
  getStoriesFeed,
  getStoryById,
  viewStory,
  deleteStory
};