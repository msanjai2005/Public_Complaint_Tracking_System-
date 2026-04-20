const Complaint = require('../models/Complaint');

/**
 * Generate a unique complaint ID in format SWC-YYYYNNNN
 */
const generateComplaintId = async () => {
  const year = new Date().getFullYear();
  const lastComplaint = await Complaint.findOne({
    complaintId: new RegExp(`^SWC-${year}`),
  }).sort({ complaintId: -1 });

  let nextNum = 1;
  if (lastComplaint) {
    const lastNum = parseInt(lastComplaint.complaintId.split(`SWC-${year}`)[1]);
    nextNum = lastNum + 1;
  }

  return `SWC-${year}${String(nextNum).padStart(4, '0')}`;
};

module.exports = generateComplaintId;
