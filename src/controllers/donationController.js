
const donationModel = require("../models/donationModel");

exports.getDonationsByCase = async (req, res) => {
  try {
    const { case_id } = req.params;
    const donations = await donationModel.getDonationsByCaseId(case_id);
    res.json({ message: "Donations fetched successfully", donations });
  } catch (err) {
    console.error("Get donations error:", err);
    res.status(500).json({ error: "Failed to fetch donations" });
  }
};


exports.createDonation = async (req, res) => {
  try {
    const {
      donor_id,
      medical_case_id,
      amount,
      currency,
      donation_type,
      payment_method,
      transaction_id,
      is_anonymous,
      donor_message
    } = req.body;

    if (!donor_id || !medical_case_id || !amount) {
      return res.status(400).json({ error: "donor_id, medical_case_id and amount are required" });
    }

    const donation_id = await donationModel.createDonation({
      donor_id,
      medical_case_id,
      amount,
      currency: currency || "USD",
      donation_type: donation_type || "one_time",
      payment_method: payment_method || null,
      transaction_id: transaction_id || null,
      is_anonymous: is_anonymous ? 1 : 0,
      donor_message: donor_message || null
    });

    res.status(201).json({ message: "Donation created successfully", donation_id });
  } catch (err) {
    console.error("Create donation error:", err);
    res.status(500).json({ error: "Failed to create donation" });
  }
};

exports.getDonationById = async (req, res) => {
  try {
    const { donation_id } = req.params;
    const donation = await donationModel.getDonationById(donation_id);
    if (!donation) return res.status(404).json({ error: "Donation not found" });
    res.json({ donation });
  } catch (err) {
    console.error("Get donation error:", err);
    res.status(500).json({ error: "Failed to fetch donation" });
  }
};

exports.updateDonation = async (req, res) => {
  try {
    const { donation_id } = req.params;
    const updated = await donationModel.updateDonation(donation_id, req.body);
    if (!updated) return res.status(404).json({ error: "Donation not found or nothing to update" });
    res.json({ message: "Donation updated successfully" });
  } catch (err) {
    console.error("Update donation error:", err);
    res.status(500).json({ error: "Failed to update donation" });
  }
};

exports.deleteDonation = async (req, res) => {
  try {
    const { donation_id } = req.params;
    const deleted = await donationModel.deleteDonation(donation_id);
    if (!deleted) return res.status(404).json({ error: "Donation not found" });
    res.json({ message: "Donation deleted successfully" });
  } catch (err) {
    console.error("Delete donation error:", err);
    res.status(500).json({ error: "Failed to delete donation" });
  }
};
