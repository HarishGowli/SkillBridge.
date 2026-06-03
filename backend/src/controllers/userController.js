// backend/controllers/userController.js

import User from '../models/User.js';
import bcrypt from 'bcrypt';
import fs from 'fs'; // ⭐ Used for deleting old files
import path from 'path'; // ⭐ Used for file path manipulation
// Assuming you are in an ES Module environment, adjust import for fs/path if necessary

// --- HELPER FUNCTION: Get base URL for file serving ---
const getBaseUrl = () => {
    // Replace with your actual deployed URL or dynamic host setup
    return process.env.NODE_ENV === 'production' 
        ? 'YOUR_PRODUCTION_URL' 
        : 'http://localhost:4000/uploads'; // Assuming files are served from /uploads
};
// --------------------------------------------------------

export const personalizeUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const existing = await User.findById(userId);

    if (existing.location) {
      return res.status(403).json({ message: "Personalization already done" });
    }

    Object.assign(existing, req.body);
    await existing.save();

    res.json({ message: "Personalization saved", user: existing });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        const file = req.file; // ⭐ File object from Multer
        const user = await User.findById(req.user.id);

        if (!user) {
            // ⭐ If a file was uploaded but user not found, delete the temp file
            if (file) fs.unlinkSync(file.path); 
            return res.status(404).json({ message: 'User not found' });
        }

        delete updates.password; 
        delete updates.role;
        delete updates.email;

        // ⭐ FILE HANDLING LOGIC
        if (file) {
            // 1. Delete the old profile picture (if one exists)
            if (user.profilePicUrl) {
                const oldPath = path.join(path.resolve(), 'uploads', path.basename(user.profilePicUrl));
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            // 2. Save the new file path (assuming your frontend will access the file via URL)
            // You should rename/move the file from the temporary path (file.path)
            // For simplicity, we assume the file path is correct here, but in production, 
            // you must rename the file to something permanent and secure.
            const newPath = `${getBaseUrl()}/${file.filename}`; // Example URL construction
            user.profilePicUrl = newPath;
        }

        // Update fields dynamically
        Object.keys(updates).forEach((key) => {
            // ⭐ Ensure skills are handled correctly as an array if they come as a string/array mix
            if (key === 'skills' && Array.isArray(updates.skills)) {
                user.skills = updates.skills.filter(s => s.trim() !== ''); // Save clean array
            } else if (key !== 'skills') {
                user[key] = updates[key];
            }
        });

        await user.save();
        
        user.password = undefined;

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (!user.password) {
            return res.status(400).json({ message: 'Cannot change password for social login users.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();
        
        // Note: You must ensure your server serves static files from the 'uploads' directory

        res.status(200).json({ message: 'Password updated successfully. Please log in again.' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Server error during password update.' });
    }
};

// getUserpofiile
// IMPORTANT: USE it for getting any user profile for others to publicly view
// export const getPublicProfile = async (req, res) => {
//     try {
//         const { userId } = req.params;

//         if (!userId) {
//             return res.status(400).json({ message: "User ID is required" });
//         }

//         // Fetch only essential public data
//         const user = await User.findById(userId)
//             .select("fullName role skills location bio organizationName organizationDescription websiteUrl profilePicUrl createdAt");

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         res.status(200).json(user);
//     } catch (error) {
//         console.error("Error fetching public profile:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };
