// controllers/applicationController.js
import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';

// Submit an application (volunteer)
export const submitApplication = async (req, res) => {
    try {
        const { opportunityId } = req.body;

        // Check if opportunity exists and is open
        const opportunity = await Opportunity.findById(opportunityId);
        // OPPORTUNITY LOGIC UPDATE: Check for 'close' status OR if expiryDate is passed
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date
        
        let isExpired = false;
        if (opportunity.expiryDate) {
            const expiry = new Date(opportunity.expiryDate);
            expiry.setHours(0, 0, 0, 0);
            if (expiry < today) {
                isExpired = true;
            }
        }

        if (!opportunity || opportunity.status === 'close' || isExpired) {
            return res.status(400).json({ message: 'Opportunity not available or has expired' });
        }

        // Prevent duplicate applications
        const existingApp = await Application.findOne({
            opportunityId,
            volunteerId: req.user.id,
        });
        if (existingApp) {
            return res.status(400).json({ message: 'You have already applied for this opportunity' });
        }

        const application = new Application({
            opportunityId,
            volunteerId: req.user.id,
        });

        const savedApp = await application.save();
        res.status(201).json(savedApp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all pending applications (NGO) - UPDATED POPULATE FIELDS
export const getPendingApplications = async (req, res) => {
    try {
        // Find opportunities created by this NGO
        const ngoOpportunities = await Opportunity.find({ ngoId: req.user.id }).select('_id');
        const opportunityIds = ngoOpportunities.map((o) => o._id);

        // Find applications with status 'pending' for these opportunities
        const applications = await Application.find({
            opportunityId: { $in: opportunityIds },
            status: 'pending',
        })
        // Fetch comprehensive volunteer and opportunity data for review
        .populate('volunteerId', 'fullName email bio skills location') 
        .populate('opportunityId', 'title description location');

        res.json(applications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Review an application (NGO) - LOGIC IS ALREADY CORRECT
export const reviewApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const application = await Application.findById(id).populate('opportunityId');
        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Check that the NGO owns this opportunity
        if (application.opportunityId.ngoId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to review this application' });
        }

        application.status = status;
        const updatedApp = await application.save();
        res.json(updatedApp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let applications;

        if (role === "NGO") {
            // NGO → Received applications on their opportunities (used for dash view)
            const opportunities = await Opportunity.find({ ngoId: userId }).select("_id");
            const oppIds = opportunities.map(o => o._id);

            // Fetch applications for NGO's opportunities. Populating volunteer data for review.
            applications = await Application.find({ opportunityId: { $in: oppIds } })
                .populate("volunteerId", "fullName email bio skills location") 
                .populate("opportunityId", "title");
        } else {
            // Volunteer → Sent applications (used for dash view and public listings)
            applications = await Application.find({ volunteerId: userId })
                .populate({
                    path: "opportunityId",
                    select: "title description location duration expiryDate ngoId requiredSkills", 
                    populate: {
                        path: "ngoId",
                        select: "fullName email organizationName profilePicUrl location", 
                    },
                });
        }

        res.json(applications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const withdrawMyApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const deletedApp = await Application.findOneAndDelete({
            _id: id,
            volunteerId: userId,
        });

        if (!deletedApp) {
            return res.status(404).json({ message: "Application not found or not yours" });
        }

        res.status(200).json({ message: "Application withdrawn successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};