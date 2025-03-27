import apiClient from './apiClient';

const EVENT_API = '/api/events';
const VENUE_API = '/api/venues';

const eventService = {
  // Get all events with optional filtering
  getEvents: (params) => {
    return apiClient.get(EVENT_API, { params });
  },
  
  // Get featured events for homepage
  getFeaturedEvents: () => {
    return apiClient.get(`${EVENT_API}/featured`);
  },
  
  // Get event by ID
  getEventById: (eventId) => {
    return apiClient.get(`${EVENT_API}/${eventId}`);
  },
  
  // Create new event (admin/organizer)
  createEvent: (eventData) => {
    return apiClient.post(EVENT_API, eventData);
  },
  
  // Update event (admin/organizer)
  updateEvent: (eventId, eventData) => {
    return apiClient.put(`${EVENT_API}/${eventId}`, eventData);
  },
  
  // Delete event (admin/organizer)
  deleteEvent: (eventId) => {
    return apiClient.delete(`${EVENT_API}/${eventId}`);
  },
  
  // Cancel event (admin/organizer)
  cancelEvent: (eventId, reason) => {
    return apiClient.put(`${EVENT_API}/${eventId}/cancel`, { reason });
  },
  
  // Upload event image
  uploadEventImage: (eventId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return apiClient.post(`${EVENT_API}/${eventId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Get event categories
  getCategories: () => {
    return apiClient.get(`${EVENT_API}/categories`);
  },
  
  // Get venues
  getVenues: () => {
    return apiClient.get(VENUE_API);
  },
  
  // Create venue (admin/organizer)
  createVenue: (venueData) => {
    return apiClient.post(VENUE_API, venueData);
  }
};

export default eventService;

