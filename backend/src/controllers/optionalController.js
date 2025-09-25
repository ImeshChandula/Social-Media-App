// Get server health
const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Flutter Social App Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      firebase: '✅ Connected',
      socket: '✅ Active',
      scheduler: '✅ Running'
    }
  });
};

// Get server documentation
const getAPIDocumentation = (req, res) => {
  res.json({
    message: 'Flutter Social App API',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth - Authentication endpoints',
      users: '/api/users - User management',
      posts: '/api/posts - Post operations',
      comments: '/api/comments - Comment system',
      friends: '/api/friends - Friend management',
      likes: '/api/likes - Like system',
      notifications: '/api/notifications - Push notifications',
      stories: '/api/stories - Story features',
      categories: '/api/categories - Content categories',
      dashboard: '/api/dashboard - Admin dashboard',
      support: '/api/support - Support system',
      appeal: '/api/appeal - Appeal system',
      marketplace: '/api/marketplace - Marketplace features',
      feed: '/api/feed - Content feed',
      activities: '/api/activities - Activity tracking',
      pages: '/api/pages - Page management'
    },
    websocket: {
      enabled: true,
      endpoint: '/socket.io',
      transports: ['websocket', 'polling']
    }
  });
};


module.exports = { getHealthStatus, getAPIDocumentation};