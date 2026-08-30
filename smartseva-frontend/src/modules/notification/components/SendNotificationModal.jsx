import React, { useState, useEffect, useRef } from 'react';
import { customerService } from '../../../api/services/customerService';
import { serviceCatalogService } from '../../../api/services/serviceCatalogService';
import { notificationService } from '../../../api/services/notificationService';
import { openSmsComposer, openWhatsApp } from '../../../utils/phoneUtils';

export default function SendNotificationModal({
  isOpen,
  onClose,
  onSuccess,
  initialCustomerId = null,
  initialCustomer = null,
  initialServiceId = null,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerServices, setCustomerServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('EMAIL'); // 'EMAIL', 'SMS', 'WHATSAPP', 'ALL'
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  const searchTimeoutRef = useRef(null);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setDeliveryResult(null);
      setIsSubmitting(false);
      setCopiedText(false);

      if (initialCustomer) {
        setSelectedCustomer(initialCustomer);
        loadCustomerServices(initialCustomer.customerId);
      } else if (initialCustomerId) {
        fetchCustomerById(initialCustomerId);
      } else {
        setSelectedCustomer(null);
        setCustomerServices([]);
        setSearchQuery('');
        setSearchResults([]);
      }

      if (initialServiceId) {
        setSelectedServiceId(String(initialServiceId));
      } else {
        setSelectedServiceId('');
      }

      setMessage('');
      setSelectedChannel('EMAIL');
    }
  }, [isOpen, initialCustomerId, initialCustomer, initialServiceId]);

  const fetchCustomerById = async (id) => {
    try {
      const res = await customerService.getById(id);
      const data = res?.data || res;
      if (data) {
        setSelectedCustomer(data);
        loadCustomerServices(data.customerId);
      }
    } catch (err) {
      console.error('Failed to load customer:', err);
      setError('Could not fetch customer details.');
    }
  };

  const loadCustomerServices = async (customerId) => {
    try {
      const res = await serviceCatalogService.getByCustomer(customerId);
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setCustomerServices(data);
      } else if (data?.content && Array.isArray(data.content)) {
        setCustomerServices(data.content);
      } else {
        setCustomerServices([]);
      }
    } catch (err) {
      console.warn('Failed to load customer services:', err);
      setCustomerServices([]);
    }
  };

  // Debounced customer search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await customerService.search(query.trim(), 0, 8);
        const data = res?.data || res;
        if (data && Array.isArray(data.content)) {
          setSearchResults(data.content);
        } else if (Array.isArray(data)) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    setDeliveryResult(null);
    loadCustomerServices(cust.customerId);
  };

  const handleClearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setCustomerServices([]);
    setSelectedServiceId('');
    setDeliveryResult(null);
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }).catch((err) => {
      console.error('Failed to copy text', err);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDeliveryResult(null);
    setCopiedText(false);

    if (!selectedCustomer) {
      setError('Please select a customer.');
      return;
    }

    if (!message || message.trim().length === 0) {
      setError('Please enter a notification message.');
      return;
    }

    // Contact availability validation
    if (
      (selectedChannel === 'EMAIL' || selectedChannel === 'ALL') &&
      (!selectedCustomer.email || !selectedCustomer.email.trim())
    ) {
      setError('Selected customer does not have an email address on file.');
      return;
    }

    if (
      (selectedChannel === 'SMS' || selectedChannel === 'WHATSAPP' || selectedChannel === 'ALL') &&
      (!selectedCustomer.phoneNumber || !selectedCustomer.phoneNumber.trim())
    ) {
      setError('Selected customer does not have a mobile phone number on file.');
      return;
    }

    let requestedChannels = [];
    if (selectedChannel === 'ALL') {
      requestedChannels = ['EMAIL', 'SMS', 'WHATSAPP'];
    } else {
      requestedChannels = [selectedChannel];
    }

    const payload = {
      customerId: selectedCustomer.customerId,
      serviceId: selectedServiceId ? Number(selectedServiceId) : null,
      channels: requestedChannels,
      message: message.trim(),
    };

    setIsSubmitting(true);
    try {
      const response = await notificationService.send(payload);
      const data = response?.data || response;
      setDeliveryResult(data);

      // Auto-trigger client deep links for SMS and WhatsApp
      if (Array.isArray(data?.deliveryResults)) {
        const smsResult = data.deliveryResults.find((r) => r.channel === 'SMS');
        const waResult = data.deliveryResults.find((r) => r.channel === 'WHATSAPP');

        if (smsResult && smsResult.actionLink) {
          openSmsComposer(selectedCustomer.phoneNumber, smsResult.rawMessage || message.trim());
        }

        if (waResult && waResult.actionLink) {
          openWhatsApp(selectedCustomer.phoneNumber, waResult.rawMessage || message.trim());
        }
      }

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      console.error('Failed to send notification:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to dispatch notification.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const hasEmail = Boolean(selectedCustomer?.email && selectedCustomer.email.trim());
  const hasPhone = Boolean(selectedCustomer?.phoneNumber && selectedCustomer.phoneNumber.trim());

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0">
          {/* Modal Header */}
          <div className="modal-header bg-primary text-white py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center">
              <i className="bi bi-bell-fill me-2"></i>
              Send Customer Notification
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
              disabled={isSubmitting}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {/* Top Alert / Error Notification */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              {/* Delivery Results Card */}
              {deliveryResult && (
                <div className="alert alert-info mb-3" role="alert">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-info-circle-fill flex-shrink-0 me-2 fs-5 text-primary"></i>
                    <div className="fw-bold">
                      Notification processed successfully
                    </div>
                  </div>

                  {Array.isArray(deliveryResult.deliveryResults) && deliveryResult.deliveryResults.length > 0 && (
                    <div className="mt-2 pt-2 border-top">
                      <small className="fw-semibold text-muted d-block mb-2">Delivery Status & Actions:</small>
                      <ul className="list-unstyled mb-0 small">
                        {deliveryResult.deliveryResults.map((res, idx) => (
                          <li key={idx} className="mb-2 p-2 rounded bg-white border">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                              <div>
                                <span
                                  className={`badge ${
                                    res.channel === 'EMAIL'
                                      ? 'bg-primary'
                                      : res.channel === 'SMS'
                                      ? 'bg-success'
                                      : 'bg-success text-white'
                                  } me-2`}
                                >
                                  {res.channel}
                                </span>
                                <strong>{res.recipient || '-'}</strong>
                              </div>

                              {/* Action buttons for SMS and WhatsApp */}
                              <div className="d-flex gap-1">
                                {res.channel === 'SMS' && res.actionLink && (
                                  <>
                                    <a
                                      href={res.actionLink}
                                      className="btn btn-sm btn-outline-success py-0 px-2 fw-semibold"
                                      title="Open device SMS composer"
                                    >
                                      <i className="bi bi-chat-text me-1"></i> Open SMS
                                    </a>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary py-0 px-2"
                                      onClick={() => handleCopy(res.rawMessage || message)}
                                    >
                                      <i className="bi bi-clipboard me-1"></i> Copy
                                    </button>
                                  </>
                                )}

                                {res.channel === 'WHATSAPP' && res.actionLink && (
                                  <>
                                    <a
                                      href={res.actionLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-sm btn-outline-success py-0 px-2 fw-semibold"
                                      title="Open WhatsApp"
                                    >
                                      <i className="bi bi-whatsapp me-1"></i> Open WhatsApp
                                    </a>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary py-0 px-2"
                                      onClick={() => handleCopy(res.rawMessage || message)}
                                    >
                                      <i className="bi bi-clipboard me-1"></i> Copy
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="mt-1 extra-small text-muted" style={{ fontSize: '0.8rem' }}>
                              {res.channel === 'EMAIL' ? (
                                res.success ? (
                                  <span className="text-success fw-medium">
                                    <i className="bi bi-check-circle me-1"></i> Email sent successfully via SmartSeva Mailer.
                                  </span>
                                ) : (
                                  <span className="text-danger">
                                    <i className="bi bi-x-circle me-1"></i> {res.failureReason || 'Email delivery failed'}
                                  </span>
                                )
                              ) : res.channel === 'SMS' ? (
                                <span className="text-dark fw-medium">
                                  <i className="bi bi-phone me-1 text-success"></i> SMS composer opened. Please press <strong>Send</strong> on your device.
                                </span>
                              ) : (
                                <span className="text-dark fw-medium">
                                  <i className="bi bi-whatsapp me-1 text-success"></i> WhatsApp opened. Please press <strong>Send</strong>.
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>

                      {copiedText && (
                        <div className="badge bg-dark text-white mt-1 px-2 py-1">
                          <i className="bi bi-check2 me-1"></i> Message copied to clipboard!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Customer Selection */}
              <div className="card border-0 bg-light p-3 mb-3">
                <label className="form-label fw-bold text-secondary mb-2">
                  <i className="bi bi-person-search me-1"></i> Customer Selection
                </label>

                {!selectedCustomer ? (
                  <div className="position-relative">
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search customer by name, email, or phone number..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        autoFocus
                      />
                      {isSearching && (
                        <span className="input-group-text bg-white">
                          <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                        </span>
                      )}
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                      <ul
                        className="list-group position-absolute w-100 mt-1 shadow-sm overflow-auto"
                        style={{ maxHeight: '200px', zIndex: 1060 }}
                      >
                        {searchResults.map((cust) => (
                          <li
                            key={cust.customerId}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center cursor-pointer"
                            onClick={() => handleSelectCustomer(cust)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div>
                              <div className="fw-semibold text-primary">{cust.fullName}</div>
                              <small className="text-muted">
                                <i className="bi bi-envelope me-1"></i>
                                {cust.email || 'No email'} &bull;{' '}
                                <i className="bi bi-phone me-1"></i>
                                {cust.phoneNumber || 'No phone'}
                              </small>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCustomer(cust);
                              }}
                            >
                              Select
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                      <div className="text-muted small mt-2">
                        <i className="bi bi-info-circle me-1"></i> No matching customers found.
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                        <i className="bi bi-check-circle me-1"></i> Customer Selected
                      </span>
                      {!initialCustomer && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-danger text-decoration-none p-0"
                          onClick={handleClearSelectedCustomer}
                        >
                          <i className="bi bi-x-circle me-1"></i> Change Customer
                        </button>
                      )}
                    </div>

                    {/* Read-Only Populated Customer Fields */}
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label small text-muted mb-1">Customer Name:</label>
                        <input
                          type="text"
                          className="form-control bg-white fw-bold text-dark"
                          value={selectedCustomer.fullName || ''}
                          readOnly
                          disabled
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small text-muted mb-1">
                          <i className="bi bi-envelope me-1"></i> Email (Read-Only):
                        </label>
                        <input
                          type="text"
                          className={`form-control bg-white ${
                            hasEmail ? 'text-dark font-monospace' : 'text-danger fst-italic'
                          }`}
                          value={selectedCustomer.email || 'No email on file'}
                          readOnly
                          disabled
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small text-muted mb-1">
                          <i className="bi bi-telephone me-1"></i> Phone (Read-Only):
                        </label>
                        <input
                          type="text"
                          className={`form-control bg-white ${
                            hasPhone ? 'text-dark font-monospace' : 'text-danger fst-italic'
                          }`}
                          value={selectedCustomer.phoneNumber || 'No phone on file'}
                          readOnly
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Service Association */}
              {selectedCustomer && customerServices.length > 0 && (
                <div className="mb-3">
                  <label className="form-label small text-muted fw-semibold">
                    <i className="bi bi-file-earmark-text me-1"></i> Associate with Service Order (Optional)
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                  >
                    <option value="">-- General Citizen Communication (No specific service) --</option>
                    {customerServices.map((svc) => (
                      <option key={svc.serviceId} value={svc.serviceId}>
                        {svc.serviceName} &bull; Application: {svc.applicationNumber || `SS-${svc.serviceId}`} &bull; ({svc.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 2: Notification Channel Selection */}
              <div className="mb-3">
                <label className="form-label fw-bold text-secondary mb-2">
                  <i className="bi bi-broadcast-pin me-1"></i> Notification Channel
                </label>

                <div className="row g-2">
                  {/* Email Option */}
                  <div className="col-md-3">
                    <div className="form-check p-2 border rounded bg-light h-100">
                      <input
                        className="form-check-input ms-1"
                        type="radio"
                        name="notificationChannel"
                        id="channelEmail"
                        value="EMAIL"
                        checked={selectedChannel === 'EMAIL'}
                        onChange={(e) => setSelectedChannel(e.target.value)}
                      />
                      <label className="form-check-label ms-2 fw-semibold d-block" htmlFor="channelEmail">
                        <i className="bi bi-envelope-fill text-primary me-1"></i> Email
                      </label>
                      <div className="extra-small text-muted ms-4" style={{ fontSize: '0.75rem' }}>
                        Automatic SMTP delivery
                      </div>
                    </div>
                  </div>

                  {/* SMS Option */}
                  <div className="col-md-3">
                    <div className="form-check p-2 border rounded bg-light h-100">
                      <input
                        className="form-check-input ms-1"
                        type="radio"
                        name="notificationChannel"
                        id="channelSms"
                        value="SMS"
                        checked={selectedChannel === 'SMS'}
                        onChange={(e) => setSelectedChannel(e.target.value)}
                      />
                      <label className="form-check-label ms-2 fw-semibold d-block" htmlFor="channelSms">
                        <i className="bi bi-chat-dots-fill text-success me-1"></i> SMS
                      </label>
                      <div className="extra-small text-muted ms-4" style={{ fontSize: '0.75rem' }}>
                        Opens device SMS app
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Option */}
                  <div className="col-md-3">
                    <div className="form-check p-2 border rounded bg-light h-100">
                      <input
                        className="form-check-input ms-1"
                        type="radio"
                        name="notificationChannel"
                        id="channelWhatsApp"
                        value="WHATSAPP"
                        checked={selectedChannel === 'WHATSAPP'}
                        onChange={(e) => setSelectedChannel(e.target.value)}
                      />
                      <label className="form-check-label ms-2 fw-semibold d-block" htmlFor="channelWhatsApp">
                        <i className="bi bi-whatsapp text-success me-1"></i> WhatsApp
                      </label>
                      <div className="extra-small text-muted ms-4" style={{ fontSize: '0.75rem' }}>
                        Opens WhatsApp Web/App
                      </div>
                    </div>
                  </div>

                  {/* All Channels Option */}
                  <div className="col-md-3">
                    <div className="form-check p-2 border rounded bg-light h-100">
                      <input
                        className="form-check-input ms-1"
                        type="radio"
                        name="notificationChannel"
                        id="channelAll"
                        value="ALL"
                        checked={selectedChannel === 'ALL'}
                        onChange={(e) => setSelectedChannel(e.target.value)}
                      />
                      <label className="form-check-label ms-2 fw-semibold d-block" htmlFor="channelAll">
                        <i className="bi bi-stars text-warning me-1"></i> All Channels
                      </label>
                      <div className="extra-small text-muted ms-4" style={{ fontSize: '0.75rem' }}>
                        Email + SMS + WhatsApp
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Message Content */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold text-secondary mb-0">
                    <i className="bi bi-chat-left-text me-1"></i> Notification Message
                  </label>
                  <span className="badge bg-secondary-subtle text-secondary small">
                    {message.length} characters
                  </span>
                </div>

                {/* Message Quick Presets */}
                <div className="d-flex flex-wrap gap-1 mb-2">
                  <small className="text-muted align-self-center me-1">Quick Templates:</small>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm py-0 px-2"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() =>
                      setMessage(
                        'Your documents are processed and ready for collection at our center during working hours.'
                      )
                    }
                  >
                    Documents Ready
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm py-0 px-2"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() =>
                      setMessage(
                        'Please submit your missing address proof and identity documents to proceed with verification.'
                      )
                    }
                  >
                    Missing Docs
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm py-0 px-2"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() =>
                      setMessage(
                        'Your application has been received and is currently being processed by our team.'
                      )
                    }
                  >
                    Application In Review
                  </button>
                </div>

                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Enter the notification message to be delivered to the customer..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
                <div className="form-text small">
                  The message will be sent via Email and prepared in the SMS/WhatsApp composer with official SmartSeva branding.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer bg-light py-2 px-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Close
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 fw-semibold"
                disabled={
                  isSubmitting ||
                  !selectedCustomer ||
                  !message.trim() ||
                  ((selectedChannel === 'EMAIL' || selectedChannel === 'ALL') && !hasEmail) ||
                  ((selectedChannel === 'SMS' || selectedChannel === 'WHATSAPP' || selectedChannel === 'ALL') && !hasPhone)
                }
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill me-1"></i> Send / Open Composer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
