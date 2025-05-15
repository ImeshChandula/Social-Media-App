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
    
    const story = new Story(storyData);//Creates a new Story instance using the data
    await story.save(); //Saves the story to the database
    
    res.status(201).json({ // Returns a success response with status 201 (Created) and the story data
      message: 'Story created successfully', 
      story: { ...story, id: story.id } 
    });
  } catch (error) { // Handles any errors that occur during the process
    console.error('Error creating story:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user's stories
const getCurrentUserStories = async (req, res) => {
  try {
    const userId = req.user.id;//Gets the current user's ID from the authentication middleware
    const stories = await Story.findByUserId(userId); //Uses the Story model to find all stories created by this user

    
    res.json(stories); // Returns those stories as a JSON response
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
    const userIds = [userId, ...friendIds]; // Creates an array containing both the user's ID and their friends' IDs. this will list all the users whose stories we want to fetch 
    
    // Get stories from these users
    //Fetches all stories from these users using a special method in the Story model
    const stories = await Story.getFriendsStories(userIds);
    
    // Group stories by user
    const storiesByUser = {};

    /*
    Loops through each story:

    If this is the first story from this user, adds user details and creates an empty stories array
    Adds the story to the appropriate user's stories array


    This creates a structure like: { userId: { user: {...}, stories: [...] } }
  */
    
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

// Get a specific story by 
//Gets the story ID from the URL parameters
// and fetches the story from the database using the Story model
// and checks if the story is expired. If it is, returns a 404 Gone status
const getStoryById = async (req, res) => {
  try {
    const storyId = req.params.id;
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Check if story is 
    //Calls the isExpired() method on the story object to check if it's older than 24 hours
    //Returns 410 (Gone) status code if the story has expired
    if (story.isExpired()) {
      return res.status(410).json({ message: 'Story has expired' });
    }
    
    // Get user details for the story
    const user = await User.findById(story.userId);
    
    // Check if the current user has permission to view the story
    //Gets the user who created the story and checks the privacy settings
    /*
      Checks privacy settings:
      If the story is set to 'friends' privacy
      And the current user is not in the creator's friends list
      And the current user is not the creator
      Then returns 403 (Forbidden) error
    */
    if (story.privacy === 'friends' && !user.friends.includes(req.user.id) && story.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to view this story' });
    }
    
    //Returns both the story data and minimal user data for displaying
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
    
    // Delete media file from storage if it exists in the firebase storage
    //Checks if the story has a media URL and deletes it from storage using the deleteFileFromStorage function
    if (story.mediaUrl) {
      await deleteFileFromStorage(story.mediaUrl);
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