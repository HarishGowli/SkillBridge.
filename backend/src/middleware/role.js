// middleware/role.js
export const isNgo = (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    if (req.user.role.toLowerCase() !== 'ngo') {
        return res.status(403).json({ message: 'Access denied: NGO only.' });
    }
    next();
};
export const isVolunteer = (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    if (req.user.role.toLowerCase() !== 'volunteer') {
        return res.status(403).json({ message: 'Access denied: Volunteer only.' });
    }

    next();
};