import apiClient from './apiClient';

const TICKET_API = '/tickets';

const ticketService = {
  // Reserve a ticket for an event
  reserveTicket: (eventId) => {
    return apiClient.post(`/api/events/${eventId}/tickets/reserve`);
  },
  
  // Purchase a reserved ticket
  purchaseTicket: (ticketId, paymentData) => {
    return apiClient.post(`${TICKET_API}/${ticketId}/purchase`, paymentData);
  },
  
  // Get user's tickets
  getUserTickets: () => {
    return apiClient.get('/api/tickets/my');
  },
  
  // Get specific ticket details
  getTicketById: (ticketId) => {
    return apiClient.get(`${TICKET_API}/${ticketId}`);
  },
  
  // Cancel a ticket
  cancelTicket: (ticketId) => {
    return apiClient.post(`${TICKET_API}/${ticketId}/cancel`);
  },
  
  // Validate a ticket (admin/organizer)
  validateTicket: (ticketId, qrData) => {
    return apiClient.post(`${TICKET_API}/${ticketId}/validate`, { qrData });
  },
  
  // Get tickets for an event (admin/organizer)
  getEventTickets: (eventId, params) => {
    return apiClient.get(`/events/${eventId}/tickets`, { params });
  },
  
  // Get ticket inventory for an event (admin/organizer)
  getTicketInventory: (eventId) => {
    return apiClient.get(`/events/${eventId}/ticket-inventory`);
  },
  
  // Update ticket inventory (admin/organizer)
  updateTicketInventory: (eventId, inventoryData) => {
    return apiClient.put(`/events/${eventId}/ticket-inventory`, inventoryData);
  }
};

export default ticketService;

