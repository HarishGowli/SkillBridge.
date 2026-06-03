// controllers/opportunityController.js

import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js'; 
import { io, onlineVolunteers, sendEmail } from '../server.js'; 

// Create a new opportunity
export const createOpportunity = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Authentication context missing. Cannot create opportunity.' });
        }

        const { title, description, requiredSkills, duration, location, expiryDate } = req.body;
        const ngoName = req.user.organizationName || req.user.fullName || 'A Partner NGO';
        const newOpportunity = new Opportunity({
            ngoId: req.user.id, 
            title,
            description,
            requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
            duration,
            location,
            createdAt: new Date(), 
            expiryDate: expiryDate 
        });

        const savedOpportunity = await newOpportunity.save();
        
        // ================== Notify Matching Volunteers ==================
        const oppSkills = savedOpportunity.requiredSkills;
        const oppLocation = savedOpportunity.location;
        
        // 1. Find matching volunteers:
        const matchingVolunteers = await User.find({
            role: 'VOLUNTEER',
            $or: [
                { skills: { $in: oppSkills } }, 
                { location: { $regex: oppLocation, $options: 'i' } } 
            ]
        }).select('email fullName'); 

        // 2. Notify each matching volunteer
        for (const volunteer of matchingVolunteers) {
            const userId = volunteer._id.toString();
            const socketId = onlineVolunteers.get(userId);
            
            // a) Socket.IO Real-time Notification
            if (socketId) {
                io.to(socketId).emit('newOpportunityMatch', {
                    opportunityId: savedOpportunity._id,
                    title: savedOpportunity.title,
                    ngoName: req.user.organizationName || req.user.fullName, 
                    message: `A new opportunity matching your profile has been posted: ${savedOpportunity.title}`
                });
            }

            // b) Email Notification
            const emailSubject = `New Volunteering Opportunity Match: ${savedOpportunity.title}`;
            const emailText = `Hello ${volunteer.fullName},\n\nA new volunteering opportunity, "${savedOpportunity.title}", has been posted that matches your skills or location! Check it out now.\n\nOpportunity Details:\nLocation: ${savedOpportunity.location}\nSkills: ${oppSkills.join(', ')}\n\nCheck the dashboard for more details.`;
            const emailHtml = `
                <p>Hello <strong>${volunteer.fullName}</strong>,</p>
                <p>A new volunteering opportunity, <strong>"${savedOpportunity.title}"</strong>, has been posted that matches your skills or location! Check it out now.</p>
                <h3>Opportunity Details:</h3>
                <ul>
                    <li><strong>NGO:</strong> ${req.user.organizationName || req.user.fullName}</li>
                    <li><strong>Location:</strong> ${savedOpportunity.location}</li>
                    <li><strong>Required Skills:</strong> ${oppSkills.join(', ')}</li>
                </ul>
                <p>Click <a href="${process.env.CORS_ORIGIN}/opportunities">here</a> to view all opportunities.</p>
                <p>Happy volunteering!</p>
            `;
            
            sendEmail(volunteer.email, emailSubject, emailText, emailHtml);
            
        }

        res.status(201).json(savedOpportunity);
    } catch (err) {
        console.error("Opportunity Creation Error:", err.message, err.errors || err); 
        
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation Error: Check all required fields.",
                details: err.errors
            });
        }
        
        res.status(500).json({ message: "Server error during opportunity creation." });
    }
};

// Get all opportunities - UPDATED FOR FILTERS
export const getOpportunities = async (req, res) => {
    try {
        const { skills, location, duration } = req.query; 
        const filter = {}; 

        // 1. Skill Filtering 
        if (skills) {
            const skillArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
            if (skillArray.length > 0) {
                filter.requiredSkills = { $in: skillArray };
            }
        }
        
        // 2. Location Filtering 
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }
        
        // 3. Duration Filtering 
        if (duration) {
            filter.duration = { $regex: duration, $options: 'i' };
        }

        // Fetch NGO name, profile pic, and creation date
        const opportunities = await Opportunity.find(filter)
            .populate('ngoId', 'organizationName fullName profilePicUrl createdAt')
            .sort({ createdAt: -1 }); // Sort by newest first
            
        res.json(opportunities);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get opportunities for the currently logged-in NGO
export const getMyOpportunities = async (req, res) => {
    try {
        const id = req.user.id;
        // Fetch only opportunities created by the logged-in NGO
        const opportunities = await Opportunity.find({ ngoId: id }); 
        res.json(opportunities);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Update an existing opportunity (with ownership check)
export const updateOpportunity = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const opportunity = await Opportunity.findById(id);
        if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });

        if (opportunity.ngoId.toString() !== req.user.id) {
             return res.status(403).json({ message: "Forbidden: You do not own this opportunity." });
        }
       
        delete updateData.postedDate;
        
        const updatedOpportunity = await Opportunity.findByIdAndUpdate(id, updateData, { new: true });
        res.json(updatedOpportunity);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete an opportunity (with ownership check)
export const deleteOpportunity = async (req, res) => {
    try {
        const { id } = req.params;
      
        const opportunity = await Opportunity.findById(id);
        if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });

        if (opportunity.ngoId.toString() !== req.user.id) {
             return res.status(403).json({ message: "Forbidden: You do not own this opportunity." });
        }
        
        const deleted = await Opportunity.findByIdAndDelete(id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};